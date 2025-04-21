const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
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
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // 🎯 Only handle when checkout session is complete
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    const userId = session.client_reference_id;

    if (!userId) {
      console.error('❌ Missing client_reference_id (user ID)');
      return {
        statusCode: 400,
        body: 'Missing user ID',
      };
    }

    // ✅ Mark the user as subscribed in Supabase
    const { error } = await supabase
      .from('users_meta')
      .update({ subscribed: true })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Supabase update failed:', error.message);
      return {
        statusCode: 500,
        body: 'Failed to update user subscription status',
      };
    }

    console.log(`✅ User ${userId} marked as subscribed`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
