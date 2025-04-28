import { buffer } from 'micro';
import Stripe from 'stripe';

const stripeWebhook = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export async function handler(event) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const bodyBuffer = await buffer(event);

  let evt;
  try {
    evt = stripeWebhook.webhooks.constructEvent(
      bodyBuffer,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('handle-webhook signature verification error:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (evt.type === 'checkout.session.completed') {
    const session = evt.data.object;
    // TODO: update your database, e.g. mark user as subscribed
  }

  return { statusCode: 200, body: 'Received' };
}
