const Stripe = require('stripe');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const stripeConfig = require('../config/stripeConfig');

const stripe = Stripe(stripeConfig.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId, userId, email, billingCycle } = req.body;
    
    // Fetch plan from database
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (!plan.isActive) {
      return res.status(400).json({ error: 'Plan is not active' });
    }

    // Determine price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
    const stripePriceId = billingCycle === 'yearly' ? plan.stripePriceIds.yearly : plan.stripePriceIds.monthly;

    if (price <= 0) {
      return res.status(400).json({ error: 'Plan is free - no payment required' });
    }

    // If no Stripe price ID, create a one-time payment
    if (!stripePriceId) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: price * 100, // Convert to paise
              recurring: billingCycle === 'yearly' ? { interval: 'year' } : { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${stripeConfig.FRONTEND_URL}/pricing?success=true&plan=${plan.name}`,
        cancel_url: `${stripeConfig.FRONTEND_URL}/pricing?canceled=true`,
        metadata: { 
          userId, 
          planId: plan._id.toString(), 
          planName: plan.name,
          billingCycle 
        },
      });
      return res.json({ url: session.url });
    }

    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${stripeConfig.FRONTEND_URL}/pricing?success=true&plan=${plan.name}`,
      cancel_url: `${stripeConfig.FRONTEND_URL}/pricing?canceled=true`,
      metadata: { 
        userId, 
        planId: plan._id.toString(), 
        planName: plan.name,
        billingCycle 
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

exports.stripeWebhook = async (req, res) => {
  // Check if webhook secret is configured
  if (!stripeConfig.STRIPE_WEBHOOK_SECRET) {
    console.log('⚠️  Webhook secret not configured - skipping webhook verification');
    return res.status(200).json({ received: true, message: 'Webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      stripeConfig.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const planId = session.metadata.planId;
    const planName = session.metadata.planName;
    
    console.log('✅ Payment completed:', { userId, planId, planName, sessionId: session.id });
    
    // Update user subscription in DB
    try {
      await User.findByIdAndUpdate(userId, { 
        subscription: planName.toLowerCase(),
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      console.log('✅ User subscription updated:', userId);
    } catch (error) {
      console.error('❌ Error updating user subscription:', error);
    }
  }
  
  res.json({ received: true });
};