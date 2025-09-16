const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Directory = require('../models/directoryModel');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

// Parse uploaded file
router.post('/parse-import', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let directories = [];
    let errors = [];

    if (fileExtension === '.csv') {
      directories = await parseCSVFile(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      directories = await parseExcelFile(filePath);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Validate directories
    const validatedDirectories = directories.map((dir, index) => {
      const validationErrors = validateDirectory(dir);
      return {
        ...dir,
        rowIndex: index + 1,
        errors: validationErrors
      };
    });

    res.json({
      directories: validatedDirectories,
      errors: errors
    });
  } catch (error) {
    console.error('Error parsing import file:', error);
    res.status(500).json({ error: 'Failed to parse import file' });
  }
});

// Validate directories before import
router.post('/validate-import', protect, adminOnly, async (req, res) => {
  try {
    const { directories } = req.body;

    if (!directories || !Array.isArray(directories)) {
      return res.status(400).json({ error: 'Directories array is required' });
    }

    const validatedDirectories = [];
    const errors = [];

    for (const directory of directories) {
      const validationErrors = validateDirectory(directory);
      
      // Check for duplicates
      const existingDirectory = await Directory.findOne({ 
        $or: [
          { name: directory.name },
          { domain: directory.domain }
        ]
      });

      if (existingDirectory) {
        validationErrors.push('Directory with this name or domain already exists');
      }

      validatedDirectories.push({
        ...directory,
        errors: validationErrors,
        isDuplicate: !!existingDirectory
      });
    }

    res.json({
      directories: validatedDirectories,
      errors: errors
    });
  } catch (error) {
    console.error('Error validating directories:', error);
    res.status(500).json({ error: 'Failed to validate directories' });
  }
});

// Bulk import directories
router.post('/bulk-import', protect, adminOnly, async (req, res) => {
  try {
    const { directories } = req.body;

    if (!directories || !Array.isArray(directories)) {
      return res.status(400).json({ error: 'Directories array is required' });
    }

    const validDirectories = directories.filter(dir => 
      !dir.errors || dir.errors.length === 0
    );

    if (validDirectories.length === 0) {
      return res.status(400).json({ error: 'No valid directories to import' });
    }

    const importResults = {
      totalRows: directories.length,
      validRows: validDirectories.length,
      invalidRows: directories.length - validDirectories.length,
      duplicateRows: 0,
      importedRows: 0,
      errors: [],
      duplicates: []
    };

    const importedDirectories = [];

    for (const directoryData of validDirectories) {
      try {
        // Check for duplicates again
        const existingDirectory = await Directory.findOne({ 
          $or: [
            { name: directoryData.name },
            { domain: directoryData.domain }
          ]
        });

        if (existingDirectory) {
          importResults.duplicateRows++;
          importResults.duplicates.push(directoryData.name);
          continue;
        }

        // Create directory
        const directory = new Directory({
          name: directoryData.name,
          domain: directoryData.domain,
          description: directoryData.description || '',
          category: directoryData.category || 'business',
          country: directoryData.country || 'Global',
          classification: directoryData.classification || 'Directory Submission',
          pageRank: parseInt(directoryData.pageRank) || 0,
          daScore: parseInt(directoryData.daScore) || 0,
          spamScore: parseInt(directoryData.spamScore) || 0,
          isPremium: directoryData.isPremium === 'true' || directoryData.isPremium === true,
          requiresApproval: directoryData.requiresApproval !== 'false' && directoryData.requiresApproval !== false,
          submissionUrl: directoryData.submissionUrl,
          contactEmail: directoryData.contactEmail || '',
          submissionGuidelines: directoryData.submissionGuidelines || '',
          requiredFields: directoryData.requiredFields ? directoryData.requiredFields.split(',').map(f => f.trim()) : [],
          priority: parseInt(directoryData.priority) || 0,
          freeUserLimit: parseInt(directoryData.freeUserLimit) || 0,
          starterUserLimit: parseInt(directoryData.starterUserLimit) || 5,
          proUserLimit: parseInt(directoryData.proUserLimit) || 20,
          businessUserLimit: parseInt(directoryData.businessUserLimit) || 50,
          enterpriseUserLimit: parseInt(directoryData.enterpriseUserLimit) || -1,
          isCustom: true,
          createdBy: req.userId
        });

        await directory.save();
        importedDirectories.push(directory);
        importResults.importedRows++;
      } catch (error) {
        console.error('Error importing directory:', error);
        importResults.errors.push(`Failed to import ${directoryData.name}: ${error.message}`);
      }
    }

    res.json(importResults);
  } catch (error) {
    console.error('Error bulk importing directories:', error);
    res.status(500).json({ error: 'Failed to bulk import directories' });
  }
});

// Helper function to parse CSV file
async function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Helper function to parse Excel file
async function parseExcelFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    return jsonData;
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + error.message);
  }
}

// Helper function to validate directory data
function validateDirectory(directory) {
  const errors = [];
  const requiredFields = ['name', 'domain', 'category', 'classification', 'submissionUrl'];

  // Check required fields
  for (const field of requiredFields) {
    if (!directory[field] || directory[field].toString().trim() === '') {
      errors.push(`${field} is required`);
    }
  }

  // Validate domain URL
  if (directory.domain) {
    try {
      new URL(directory.domain);
    } catch {
      errors.push('Invalid domain URL format');
    }
  }

  // Validate submission URL
  if (directory.submissionUrl) {
    try {
      new URL(directory.submissionUrl);
    } catch {
      errors.push('Invalid submission URL format');
    }
  }

  // Validate email
  if (directory.contactEmail && directory.contactEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(directory.contactEmail)) {
      errors.push('Invalid contact email format');
    }
  }

  // Validate numeric fields
  const numericFields = ['pageRank', 'daScore', 'spamScore', 'priority', 'freeUserLimit', 'starterUserLimit', 'proUserLimit', 'businessUserLimit', 'enterpriseUserLimit'];
  for (const field of numericFields) {
    if (directory[field] && isNaN(parseInt(directory[field]))) {
      errors.push(`${field} must be a valid number`);
    }
  }

  // Validate boolean fields
  const booleanFields = ['isPremium', 'requiresApproval'];
  for (const field of booleanFields) {
    if (directory[field] && !['true', 'false', true, false].includes(directory[field])) {
      errors.push(`${field} must be true or false`);
    }
  }

  return errors;
}

module.exports = router;
