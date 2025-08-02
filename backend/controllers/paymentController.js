const Stripe = require('stripe');
const User = require('../models/userModel');
const stripeConfig = require('../config/stripeConfig');

const stripe = Stripe(stripeConfig.STRIPE_SECRET_KEY);

const plans = {
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
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      stripeConfig.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;
    // Update user subscription in DB
    await User.findByIdAndUpdate(userId, { subscription: plan });
  }
  res.json({ received: true });
}; 