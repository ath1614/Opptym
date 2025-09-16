const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Submission = require('../models/submissionModel');
const Directory = require('../models/directoryModel');
const ReportTemplate = require('../models/reportTemplateModel');

// Get all report templates
router.get('/templates', protect, adminOnly, async (req, res) => {
  try {
    const templates = await ReportTemplate.find({}).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({ error: 'Failed to fetch report templates' });
  }
});

// Create new report template
router.post('/templates', protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      fields,
      filters,
      chartType,
      isCustom
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const template = new ReportTemplate({
      name,
      description,
      category: category || 'custom',
      fields: fields || [],
      filters: filters || [],
      chartType: chartType || 'table',
      isCustom: isCustom !== undefined ? isCustom : true,
      createdBy: req.userId
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating report template:', error);
    res.status(500).json({ error: 'Failed to create report template' });
  }
});

// Generate report
router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { templateId, filters, fields } = req.body;

    let data = [];
    let headers = [];

    // Determine data source based on template
    if (templateId === 'user_analytics' || fields.includes('name') && fields.includes('email')) {
      // User data
      let query = {};
      
      // Apply filters
      if (filters) {
        filters.forEach(filter => {
          if (filter.field === 'subscription' && filter.operator === 'in') {
            query.subscription = { $in: filter.value };
          } else if (filter.field === 'status' && filter.operator === 'equals') {
            query.status = filter.value;
          }
        });
      }

      const users = await User.find(query).select('-password');
      
      headers = fields || ['name', 'email', 'subscription', 'status', 'createdAt', 'lastActive'];
      data = users.map(user => 
        headers.map(header => {
          switch (header) {
            case 'name': return user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
            case 'email': return user.email;
            case 'subscription': return user.subscription || 'free';
            case 'status': return user.status || 'active';
            case 'joinDate': return user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
            case 'lastActive': return user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A';
            case 'projectsCount': return user.projectsCount || 0;
            default: return user[header] || 'N/A';
          }
        })
      );

    } else if (templateId === 'project_performance' || fields.includes('url') && fields.includes('status')) {
      // Project data
      let query = {};
      
      if (filters) {
        filters.forEach(filter => {
          if (filter.field === 'status' && filter.operator === 'equals') {
            query.status = filter.value;
          }
        });
      }

      const projects = await Project.find(query);
      
      headers = fields || ['name', 'url', 'status', 'createdAt', 'submissionsCount'];
      data = projects.map(project => 
        headers.map(header => {
          switch (header) {
            case 'name': return project.name || 'N/A';
            case 'url': return project.url || 'N/A';
            case 'status': return project.status || 'active';
            case 'createdAt': return project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A';
            case 'submissionsCount': return project.submissionsCount || 0;
            case 'successRate': return project.successRate || 0;
            default: return project[header] || 'N/A';
          }
        })
      );

    } else if (templateId === 'submission_analytics' || fields.includes('siteName') && fields.includes('status')) {
      // Submission data
      let query = {};
      
      if (filters) {
        filters.forEach(filter => {
          if (filter.field === 'status' && filter.operator === 'in') {
            query.status = { $in: filter.value };
          }
        });
      }

      const submissions = await Submission.find(query);
      
      headers = fields || ['siteName', 'status', 'submittedAt', 'completedAt', 'category'];
      data = submissions.map(submission => 
        headers.map(header => {
          switch (header) {
            case 'siteName': return submission.siteName || 'N/A';
            case 'status': return submission.status || 'pending';
            case 'submittedAt': return submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A';
            case 'completedAt': return submission.completedAt ? new Date(submission.completedAt).toLocaleDateString() : 'N/A';
            case 'successRate': return submission.successRate || 0;
            case 'category': return submission.category || 'N/A';
            default: return submission[header] || 'N/A';
          }
        })
      );

    } else if (templateId === 'directory_performance' || fields.includes('domain') && fields.includes('category')) {
      // Directory data
      let query = {};
      
      if (filters) {
        filters.forEach(filter => {
          if (filter.field === 'category' && filter.operator === 'in') {
            query.category = { $in: filter.value };
          }
        });
      }

      const directories = await Directory.find(query);
      
      headers = fields || ['name', 'domain', 'category', 'pageRank', 'daScore', 'submissionCount'];
      data = directories.map(directory => 
        headers.map(header => {
          switch (header) {
            case 'name': return directory.name || 'N/A';
            case 'domain': return directory.domain || 'N/A';
            case 'category': return directory.category || 'N/A';
            case 'pageRank': return directory.pageRank || 0;
            case 'daScore': return directory.daScore || 0;
            case 'submissionCount': return directory.submissionCount || 0;
            case 'successRate': return directory.successRate || 0;
            default: return directory[header] || 'N/A';
          }
        })
      );

    } else {
      // Custom report - combine all data
      const [users, projects, submissions, directories] = await Promise.all([
        User.find({}).select('-password'),
        Project.find({}),
        Submission.find({}),
        Directory.find({})
      ]);

      headers = fields || ['type', 'name', 'status', 'createdAt'];
      data = [
        ...users.map(user => ['User', user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username, user.status || 'active', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A']),
        ...projects.map(project => ['Project', project.name || 'N/A', project.status || 'active', project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A']),
        ...submissions.map(submission => ['Submission', submission.siteName || 'N/A', submission.status || 'pending', submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A']),
        ...directories.map(directory => ['Directory', directory.name || 'N/A', directory.status || 'active', directory.createdAt ? new Date(directory.createdAt).toLocaleDateString() : 'N/A'])
      ];
    }

    const reportData = {
      headers,
      rows: data,
      summary: {
        totalRows: data.length,
        totalColumns: headers.length,
        generatedAt: new Date().toISOString()
      }
    };

    res.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Export report
router.post('/export', protect, adminOnly, async (req, res) => {
  try {
    const { templateId, data, format } = req.body;

    if (!data || !format) {
      return res.status(400).json({ error: 'Report data and format are required' });
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = data.headers.join(',');
      const csvRows = data.rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      const csv = `${csvHeaders}\n${csvRows}`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="report_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);

    } else if (format === 'pdf') {
      // For PDF generation, you would typically use a library like puppeteer or pdfkit
      // For now, return a simple text representation
      const textContent = `Report: ${templateId}\nGenerated: ${new Date().toLocaleString()}\n\n${data.headers.join('\t')}\n${data.rows.map(row => row.join('\t')).join('\n')}`;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="report_${new Date().toISOString().split('T')[0]}.txt"`);
      res.send(textContent);

    } else if (format === 'excel') {
      // For Excel generation, you would typically use a library like xlsx
      // For now, return CSV format with .xlsx extension
      const csvHeaders = data.headers.join(',');
      const csvRows = data.rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      const csv = `${csvHeaders}\n${csvRows}`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="report_${new Date().toISOString().split('T')[0]}.xlsx"`);
      res.send(csv);

    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

module.exports = router;
