const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const PricingPlan = require('../models/pricingPlanModel');

// Get all pricing plans
router.get('/', async (req, res) => {
  try {
    const plans = await PricingPlan.find({}).sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
});

// Get single pricing plan
router.get('/:id', async (req, res) => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing plan' });
  }
});

// Create new pricing plan (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, billingCycle, features, limits, isActive, description } = req.body;

    // Validate required fields
    if (!name || !price || !billingCycle) {
      return res.status(400).json({ error: 'Name, price, and billing cycle are required' });
    }

    // Check if plan with same name exists
    const existingPlan = await PricingPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({ error: 'Plan with this name already exists' });
    }

    const plan = new PricingPlan({
      name,
      price,
      billingCycle,
      features: features || [],
      limits: limits || {},
      isActive: isActive !== undefined ? isActive : true,
      description: description || ''
    });

    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pricing plan' });
  }
});

// Update pricing plan (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, price, billingCycle, features, limits, isActive, description } = req.body;

    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== plan.name) {
      const existingPlan = await PricingPlan.findOne({ name, _id: { $ne: req.params.id } });
      if (existingPlan) {
        return res.status(400).json({ error: 'Plan with this name already exists' });
      }
    }

    // Update fields
    if (name) plan.name = name;
    if (price !== undefined) plan.price = price;
    if (billingCycle) plan.billingCycle = billingCycle;
    if (features) plan.features = features;
    if (limits) plan.limits = limits;
    if (isActive !== undefined) plan.isActive = isActive;
    if (description !== undefined) plan.description = description;

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
});

// Delete pricing plan (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    // Check if plan is being used by any users
    const User = require('../models/userModel');
    const usersWithPlan = await User.countDocuments({ subscription: plan.name });
    if (usersWithPlan > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete plan that is currently being used by users',
        usersCount: usersWithPlan
      });
    }

    await PricingPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pricing plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
});

// Toggle plan status (admin only)
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Pricing plan not found' });
    }

    plan.isActive = !plan.isActive;
    await plan.save();
    
    res.json({ 
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      plan 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle plan status' });
  }
});

module.exports = router;
