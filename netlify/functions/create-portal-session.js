import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, detectSessionInUrl: false } }
)

export const handler = async (event) => {
  const { user_id } = JSON.parse(event.body || '{}')
  if (!user_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing user_id' }) }
  }

  const { data, error } = await supabaseAdmin
    .from('users_meta')
    .select('stripe_customer_id')
    .eq('user_id', user_id)
    .single()

  if (error || !data?.stripe_customer_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No Stripe customer on file' }),
    }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: process.env.SITE_URL + '/settings',
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ url: session.url }),
  }
}
