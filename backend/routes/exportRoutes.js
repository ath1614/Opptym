const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const Directory = require('../models/directoryModel');
const ExportJob = require('../models/exportJobModel');

// In-memory storage for export jobs (in production, use Redis or database)
const exportJobs = new Map();

// Get all export jobs
router.get('/jobs', protect, adminOnly, async (req, res) => {
  try {
    const jobs = Array.from(exportJobs.values()).filter(job => job.createdBy === req.userId);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching export jobs:', error);
    res.status(500).json({ error: 'Failed to fetch export jobs' });
  }
});

// Get specific export job
router.get('/jobs/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = exportJobs.get(req.params.id);
    if (!job || job.createdBy !== req.userId) {
      return res.status(404).json({ error: 'Export job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching export job:', error);
    res.status(500).json({ error: 'Failed to fetch export job' });
  }
});

// Start new export job
router.post('/start', protect, adminOnly, async (req, res) => {
  try {
    const { type, format, fields, filters } = req.body;

    if (!type || !format || !fields || fields.length === 0) {
      return res.status(400).json({ error: 'Type, format, and fields are required' });
    }

    const jobId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      id: jobId,
      type,
      format,
      fields,
      filters: filters || {},
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
      createdBy: req.userId,
      error: null
    };

    exportJobs.set(jobId, job);

    // Start processing in background
    processExportJob(jobId);

    res.status(201).json(job);
  } catch (error) {
    console.error('Error starting export job:', error);
    res.status(500).json({ error: 'Failed to start export job' });
  }
});

// Preview data before export
router.post('/preview', protect, adminOnly, async (req, res) => {
  try {
    const { type, fields, filters, limit = 10 } = req.body;

    if (!type || !fields || fields.length === 0) {
      return res.status(400).json({ error: 'Type and fields are required' });
    }

    const data = await fetchDataForExport(type, fields, filters, limit);
    res.json(data);
  } catch (error) {
    console.error('Error previewing data:', error);
    res.status(500).json({ error: 'Failed to preview data' });
  }
});

// Download completed export
router.get('/download/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = exportJobs.get(req.params.id);
    if (!job || job.createdBy !== req.userId) {
      return res.status(404).json({ error: 'Export job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Export job not completed' });
    }

    // In a real implementation, you would serve the file from storage
    // For now, we'll generate the file on-demand
    const data = await fetchDataForExport(job.type, job.fields, job.filters);
    const fileContent = generateFileContent(data, job.format);

    const filename = `export_${job.type}_${new Date(job.completedAt).toISOString().split('T')[0]}.${job.format}`;
    
    res.setHeader('Content-Type', getContentType(job.format));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileContent);
  } catch (error) {
    console.error('Error downloading export:', error);
    res.status(500).json({ error: 'Failed to download export' });
  }
});

// Helper function to process export job
async function processExportJob(jobId) {
  const job = exportJobs.get(jobId);
  if (!job) return;

  try {
    // Update status to processing
    job.status = 'processing';
    job.progress = 10;
    exportJobs.set(jobId, job);

    // Fetch data
    const data = await fetchDataForExport(job.type, job.fields, job.filters);
    job.progress = 50;
    exportJobs.set(jobId, job);

    // Generate file content
    const fileContent = generateFileContent(data, job.format);
    job.progress = 80;
    exportJobs.set(jobId, job);

    // Simulate file processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark as completed
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    job.downloadUrl = `/api/admin/export/download/${jobId}`;
    exportJobs.set(jobId, job);

  } catch (error) {
    console.error('Error processing export job:', error);
    job.status = 'failed';
    job.error = error.message;
    exportJobs.set(jobId, job);
  }
}

// Helper function to fetch data for export
async function fetchDataForExport(type, fields, filters = {}, limit = null) {
  let data = [];
  let headers = fields;

  const query = buildQuery(filters);

  switch (type) {
    case 'users':
      const users = await User.find(query).select('-password').limit(limit);
      data = users.map(user => 
        fields.map(field => {
          switch (field) {
            case 'name': return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
            case 'email': return user.email;
            case 'subscription': return user.subscription || 'free';
            case 'status': return user.status || 'active';
            case 'createdAt': return user.createdAt ? new Date(user.createdAt).toISOString() : 'N/A';
            case 'lastActive': return user.lastActive ? new Date(user.lastActive).toISOString() : 'N/A';
            case 'projectsCount': return user.projectsCount || 0;
            case 'submissionsCount': return user.submissionsCount || 0;
            case 'isAdmin': return user.isAdmin || false;
            default: return user[field] || 'N/A';
          }
        })
      );
      break;

    case 'projects':
      const projects = await Project.find(query).limit(limit);
      data = projects.map(project => 
        fields.map(field => {
          switch (field) {
            case 'name': return project.name || 'N/A';
            case 'url': return project.url || 'N/A';
            case 'status': return project.status || 'active';
            case 'createdAt': return project.createdAt ? new Date(project.createdAt).toISOString() : 'N/A';
            case 'updatedAt': return project.updatedAt ? new Date(project.updatedAt).toISOString() : 'N/A';
            case 'submissionsCount': return project.submissionsCount || 0;
            case 'successRate': return project.successRate || 0;
            case 'category': return project.category || 'N/A';
            default: return project[field] || 'N/A';
          }
        })
      );
      break;

    case 'submissions':
      const submissions = await Submission.find(query).limit(limit);
      data = submissions.map(submission => 
        fields.map(field => {
          switch (field) {
            case 'siteName': return submission.siteName || 'N/A';
            case 'status': return submission.status || 'pending';
            case 'submittedAt': return submission.submittedAt ? new Date(submission.submittedAt).toISOString() : 'N/A';
            case 'completedAt': return submission.completedAt ? new Date(submission.completedAt).toISOString() : 'N/A';
            case 'category': return submission.category || 'N/A';
            case 'successRate': return submission.successRate || 0;
            case 'errorMessage': return submission.errorMessage || 'N/A';
            case 'projectId': return submission.projectId || 'N/A';
            default: return submission[field] || 'N/A';
          }
        })
      );
      break;

    case 'directories':
      const directories = await Directory.find(query).limit(limit);
      data = directories.map(directory => 
        fields.map(field => {
          switch (field) {
            case 'name': return directory.name || 'N/A';
            case 'domain': return directory.domain || 'N/A';
            case 'category': return directory.category || 'N/A';
            case 'pageRank': return directory.pageRank || 0;
            case 'daScore': return directory.daScore || 0;
            case 'spamScore': return directory.spamScore || 0;
            case 'submissionCount': return directory.submissionCount || 0;
            case 'successRate': return directory.successRate || 0;
            case 'isPremium': return directory.isPremium || false;
            default: return directory[field] || 'N/A';
          }
        })
      );
      break;

    case 'analytics':
      // Generate analytics data
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: 'active' });
      const totalProjects = await Project.countDocuments();
      const totalSubmissions = await Submission.countDocuments();
      const successfulSubmissions = await Submission.countDocuments({ status: 'success' });
      const successRate = totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0;

      data = [fields.map(field => {
        switch (field) {
          case 'date': return new Date().toISOString().split('T')[0];
          case 'totalUsers': return totalUsers;
          case 'activeUsers': return activeUsers;
          case 'totalProjects': return totalProjects;
          case 'totalSubmissions': return totalSubmissions;
          case 'successRate': return successRate.toFixed(2);
          case 'revenue': return (totalUsers * 10).toFixed(2); // Mock revenue
          default: return 'N/A';
        }
      })];
      break;

    case 'all':
      // Combine all data types
      const [allUsers, allProjects, allSubmissions, allDirectories] = await Promise.all([
        User.find({}).select('-password').limit(limit ? Math.floor(limit / 4) : null),
        Project.find({}).limit(limit ? Math.floor(limit / 4) : null),
        Submission.find({}).limit(limit ? Math.floor(limit / 4) : null),
        Directory.find({}).limit(limit ? Math.floor(limit / 4) : null)
      ]);

      headers = ['type', 'id', ...fields.filter(f => f !== 'type' && f !== 'id')];
      data = [
        ...allUsers.map(user => ['User', user._id, ...fields.filter(f => f !== 'type' && f !== 'id').map(field => {
          switch (field) {
            case 'name': return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
            case 'email': return user.email;
            case 'subscription': return user.subscription || 'free';
            case 'status': return user.status || 'active';
            default: return user[field] || 'N/A';
          }
        })]),
        ...allProjects.map(project => ['Project', project._id, ...fields.filter(f => f !== 'type' && f !== 'id').map(field => project[field] || 'N/A')]),
        ...allSubmissions.map(submission => ['Submission', submission._id, ...fields.filter(f => f !== 'type' && f !== 'id').map(field => submission[field] || 'N/A')]),
        ...allDirectories.map(directory => ['Directory', directory._id, ...fields.filter(f => f !== 'type' && f !== 'id').map(field => directory[field] || 'N/A')])
      ];
      break;

    default:
      throw new Error(`Unsupported export type: ${type}`);
  }

  return {
    headers,
    rows: data,
    summary: {
      totalRows: data.length,
      totalColumns: headers.length,
      generatedAt: new Date().toISOString()
    }
  };
}

// Helper function to build query from filters
function buildQuery(filters) {
  const query = {};
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.subscription) {
    query.subscription = { $in: Array.isArray(filters.subscription) ? filters.subscription : [filters.subscription] };
  }
  
  if (filters.category) {
    query.category = { $in: Array.isArray(filters.category) ? filters.category : [filters.category] };
  }
  
  if (filters.dateFrom && filters.dateTo) {
    query.createdAt = {
      $gte: new Date(filters.dateFrom),
      $lte: new Date(filters.dateTo)
    };
  }

  return query;
}

// Helper function to generate file content
function generateFileContent(data, format) {
  switch (format) {
    case 'csv':
      const csvHeaders = data.headers.join(',');
      const csvRows = data.rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      return `${csvHeaders}\n${csvRows}`;

    case 'json':
      const jsonData = {
        headers: data.headers,
        rows: data.rows,
        summary: data.summary
      };
      return JSON.stringify(jsonData, null, 2);

    case 'excel':
      // For Excel, we'll return CSV format (in production, use xlsx library)
      const excelHeaders = data.headers.join('\t');
      const excelRows = data.rows.map(row => 
        row.map(cell => String(cell).replace(/\t/g, ' ')).join('\t')
      ).join('\n');
      return `${excelHeaders}\n${excelRows}`;

    case 'pdf':
      // For PDF, we'll return a simple text format (in production, use pdfkit)
      const pdfContent = `Report Generated: ${data.summary.generatedAt}\n\n${data.headers.join('\t')}\n${data.rows.map(row => row.join('\t')).join('\n')}`;
      return pdfContent;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// Helper function to get content type
function getContentType(format) {
  switch (format) {
    case 'csv': return 'text/csv';
    case 'json': return 'application/json';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pdf': return 'application/pdf';
    default: return 'text/plain';
  }
}

module.exports = router;
