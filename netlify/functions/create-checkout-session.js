const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { user_id } = JSON.parse(event.body || '{}');

  if (!user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing user_id' }),
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        user_id,
      },
      success_url: `${process.env.URL}/dashboard`,
      cancel_url: `${process.env.URL}/pricing`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Stripe session error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
