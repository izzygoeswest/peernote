const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // secret key should already be in Netlify
const { buffer } = require('micro');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook error:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // 🎯 Listen for subscription success
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    console.log('✅ Subscription successful for:', session.customer_email);

    // TODO: Update your database (Supabase) here to mark user as 'paid'
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
