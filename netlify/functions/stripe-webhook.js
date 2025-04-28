import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function handler(event) {
  try {
    const payload = JSON.parse(event.body);
    // TODO: process other webhook events here
    console.log('stripe-webhook event:', payload);
    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return { statusCode: 500, body: err.message };
  }
}
