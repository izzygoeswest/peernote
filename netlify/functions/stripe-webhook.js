// netlify/functions/stripe-webhook.js
import { buffer } from 'micro'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, detectSessionInUrl: false } }
)

export async function handler(event) {
  const sig = event.headers['stripe-signature']
  const buf = await buffer(event)
  let evt

  try {
    evt = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('⚠️ Webhook signature error:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  console.log('✅ stripe-webhook received:', evt.type)

  // when subscription is created or updated, mark the user as subscribed
  if (evt.type === 'checkout.session.completed' || evt.type === 'invoice.payment_succeeded') {
    const session = evt.data.object
    const userId = session.metadata.user_id

    await supabaseAdmin
      .from('users_meta')
      .upsert(
        { user_id: userId, subscribed: true, trial_start: session.created },
        { onConflict: 'user_id' }
      )
      .then(({ error }) => {
        if (error) console.error('❌ users_meta upsert error:', error)
        else console.log('✔️ users_meta marked subscribed for', userId)
      })
  }

  return { statusCode: 200, body: 'OK' }
}
