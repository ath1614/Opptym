const Stripe = require('stripe');
const User = require('../models/userModel');
const stripeConfig = require('../config/stripeConfig');

const stripe = Stripe(stripeConfig.STRIPE_SECRET_KEY);

const plans = {
  test: {
    price: 1000, // ₹10.00 in paise (1000 paise = ₹10)
    name: 'Test Plan',
  },
  basic: {
    price: 2900, // $29.00 in cents
    name: 'Professional',
  },
  premium: {
    price: 9900, // $99.00 in cents
    name: 'Enterprise',
  },
};

exports.createCheckoutSession = async (req, res) => {
  const { plan, userId, priceId, email, billingCycle } = req.body;
  
  // Handle test plan specially - create a one-time payment
  if (plan === 'test') {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment', // One-time payment instead of subscription
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Test Plan - ₹10',
                description: 'Test payment functionality',
              },
              unit_amount: 1000, // ₹10.00 in paise
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${stripeConfig.FRONTEND_URL}/pricing?success=true&plan=test`,
        cancel_url: `${stripeConfig.FRONTEND_URL}/pricing?canceled=true`,
        metadata: { userId, plan, billingCycle },
      });
      res.json({ url: session.url });
      return;
    } catch (err) {
      res.status(500).json({ error: err.message });
      return;
    }
  }
  
  if (!priceId) return res.status(400).json({ error: 'Missing Stripe priceId' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${stripeConfig.FRONTEND_URL}/pricing?success=true`,
      cancel_url: `${stripeConfig.FRONTEND_URL}/pricing?canceled=true`,
      metadata: { userId, plan, billingCycle },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    const plan = session.metadata.plan;
    
    console.log('✅ Payment completed:', { userId, plan, sessionId: session.id });
    
    // Update user subscription in DB
    if (plan === 'test') {
      // For test plan, just log the successful payment
      console.log('🧪 Test payment successful for user:', userId);
      // You can optionally upgrade the user to a test subscription
      await User.findByIdAndUpdate(userId, { 
        subscription: 'test',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    } else {
      // Regular subscription plans
      await User.findByIdAndUpdate(userId, { subscription: plan });
    }
  }
  res.json({ received: true });
}; 