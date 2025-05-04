// netlify/functions/stripe-webhook.js

import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// 1) Disable Netlify's default body parser so we can verify Stripe's signature
export const config = {
  api: {
    bodyParser: false,
  },
}

// 2) Init Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
})

// 3) Init Supabase Admin client
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
)

export async function handler(event) {
  // **keep your existing logging**
  console.log('stripe-webhook raw body:', event.body)

  // 4) Verify Stripe signature
  let stripeEvent
  try {
    const sig = event.headers['stripe-signature']
    const buf = await buffer(event)         // raw Buffer of the request body
    stripeEvent = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  console.log('✅ stripe-webhook event:', stripeEvent.type)

  // 5) Handle the events you care about
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object
        // metadata.user_id must be set when creating the session
        const userId = session.metadata?.user_id
        const customerId = session.customer

        if (userId && customerId) {
          console.log(`→ marking ${userId} subscribed, storing cust ${customerId}`)
          await supabaseAdmin
            .from('users_meta')
            .upsert(
              {
                user_id: userId,
                subscribed: true,
                stripe_customer_id: customerId,
              },
              { onConflict: 'user_id' }
            )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object
        const customerId = subscription.customer

        if (customerId) {
          console.log(`→ marking customer ${customerId} unsubscribed`)
          await supabaseAdmin
            .from('users_meta')
            .update({ subscribed: false })
            .eq('stripe_customer_id', customerId)
        }
        break
      }

      default:
        // keep your TODO for any other handling
        console.log(`ℹ️ Unhandled Stripe event type: ${stripeEvent.type}`)
    }

    return { statusCode: 200, body: 'OK' }
  } catch (err) {
    console.error('❌ Error processing webhook event:', err)
    return { statusCode: 500, body: 'Internal Server Error' }
  }
}
