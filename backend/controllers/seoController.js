const SeoToolResult = require('../models/seoToolResultModel');
const keywordDensity = require('../services/keywordDensity');
const backlinkChecker = require('../services/backlinkchecker');

const runTool = async (req, res) => {
  const { projectId } = req.params;
  const { toolName, url } = req.body;

  let result = [];

  switch (toolName) {
    case 'Keyword Density':
      result = await keywordDensity(url);
      break;
    case 'Backlink Checker':
      result = await backlinkChecker(url);
      break;
    default:
      return res.status(400).json({ error: 'Tool not supported' });
  }

  const saved = await SeoToolResult.create({
    projectId,
    toolName,
    result,
  });

  res.status(201).json(saved);
};

module.exports = { runTool };
