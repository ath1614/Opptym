const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const PricingPlan = require('../models/pricingPlanModel');
const PlanHistory = require('../models/planHistoryModel');

// Get plan history with filters
router.get('/history', protect, adminOnly, async (req, res) => {
  try {
    const { planId, action, changedBy, dateFrom, dateTo, search } = req.query;
    
    let query = {};
    
    if (planId) query.planId = planId;
    if (action) query.action = action;
    if (changedBy) query.changedBy = changedBy;
    
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }
    
    if (search) {
      query.$or = [
        { planName: { $regex: search, $options: 'i' } },
        { 'changedBy.name': { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } }
      ];
    }

    const historyEntries = await PlanHistory.find(query)
      .populate('changedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(historyEntries);
  } catch (error) {
    console.error('Error fetching plan history:', error);
    res.status(500).json({ error: 'Failed to fetch plan history' });
  }
});

// Get specific plan history
router.get('/:planId/history', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;
    const { limit = 50 } = req.query;

    const historyEntries = await PlanHistory.find({ planId })
      .populate('changedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(historyEntries);
  } catch (error) {
    console.error('Error fetching plan history:', error);
    res.status(500).json({ error: 'Failed to fetch plan history' });
  }
});

// Rollback plan to specific version
router.post('/:planId/rollback', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;
    const { version, reason } = req.body;

    if (!version) {
      return res.status(400).json({ error: 'Version is required for rollback' });
    }

    // Find the history entry for the target version
    const targetEntry = await PlanHistory.findOne({ 
      planId, 
      version: parseInt(version) 
    });

    if (!targetEntry) {
      return res.status(404).json({ error: 'Target version not found' });
    }

    // Get current plan
    const currentPlan = await PricingPlan.findById(planId);
    if (!currentPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create rollback entry
    const rollbackEntry = new PlanHistory({
      planId,
      planName: currentPlan.name,
      action: 'rollback',
      changes: [{
        field: 'version',
        oldValue: currentPlan.version || 1,
        newValue: version
      }],
      changedBy: req.userId,
      timestamp: new Date(),
      reason: reason || `Rollback to version ${version}`,
      version: (currentPlan.version || 1) + 1,
      isRollbackable: false
    });

    await rollbackEntry.save();

    // Update plan with rollback data
    const rollbackData = targetEntry.changes.reduce((acc, change) => {
      acc[change.field] = change.newValue;
      return acc;
    }, {});

    await PricingPlan.findByIdAndUpdate(planId, {
      ...rollbackData,
      version: (currentPlan.version || 1) + 1,
      updatedAt: new Date()
    });

    res.json({ 
      message: `Successfully rolled back to version ${version}`,
      newVersion: (currentPlan.version || 1) + 1
    });
  } catch (error) {
    console.error('Error rolling back plan:', error);
    res.status(500).json({ error: 'Failed to rollback plan' });
  }
});

// Create plan history entry (called by plan update endpoints)
router.post('/:planId/history', protect, adminOnly, async (req, res) => {
  try {
    const { planId } = req.params;
    const { action, changes, reason } = req.body;

    if (!action || !changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Action and changes are required' });
    }

    const plan = await PricingPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const historyEntry = new PlanHistory({
      planId,
      planName: plan.name,
      action,
      changes,
      changedBy: req.userId,
      timestamp: new Date(),
      reason,
      version: (plan.version || 1) + 1,
      isRollbackable: action !== 'created' && action !== 'deleted'
    });

    await historyEntry.save();

    // Update plan version
    await PricingPlan.findByIdAndUpdate(planId, {
      version: (plan.version || 1) + 1,
      updatedAt: new Date()
    });

    res.status(201).json(historyEntry);
  } catch (error) {
    console.error('Error creating plan history entry:', error);
    res.status(500).json({ error: 'Failed to create plan history entry' });
  }
});

// Get plan version comparison
router.get('/:planId/compare/:version1/:version2', protect, adminOnly, async (req, res) => {
  try {
    const { planId, version1, version2 } = req.params;

    const [entry1, entry2] = await Promise.all([
      PlanHistory.findOne({ planId, version: parseInt(version1) }),
      PlanHistory.findOne({ planId, version: parseInt(version2) })
    ]);

    if (!entry1 || !entry2) {
      return res.status(404).json({ error: 'One or both versions not found' });
    }

    const comparison = {
      version1: {
        version: entry1.version,
        timestamp: entry1.timestamp,
        changes: entry1.changes
      },
      version2: {
        version: entry2.version,
        timestamp: entry2.timestamp,
        changes: entry2.changes
      },
      differences: []
    };

    // Find differences between versions
    const allFields = new Set([
      ...entry1.changes.map(c => c.field),
      ...entry2.changes.map(c => c.field)
    ]);

    allFields.forEach(field => {
      const change1 = entry1.changes.find(c => c.field === field);
      const change2 = entry2.changes.find(c => c.field === field);

      if (change1 && change2) {
        if (JSON.stringify(change1.newValue) !== JSON.stringify(change2.newValue)) {
          comparison.differences.push({
            field,
            version1Value: change1.newValue,
            version2Value: change2.newValue
          });
        }
      } else if (change1) {
        comparison.differences.push({
          field,
          version1Value: change1.newValue,
          version2Value: null
        });
      } else if (change2) {
        comparison.differences.push({
          field,
          version1Value: null,
          version2Value: change2.newValue
        });
      }
    });

    res.json(comparison);
  } catch (error) {
    console.error('Error comparing plan versions:', error);
    res.status(500).json({ error: 'Failed to compare plan versions' });
  }
});

module.exports = router;
