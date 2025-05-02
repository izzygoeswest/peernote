// netlify/functions/send-reminders.js

import mailgun from 'mailgun-js'
import { createClient } from '@supabase/supabase-js'

// note: we’re using your VITE_ and SUPABASE_SERVICE_ROLE_KEY names exactly
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain:  process.env.MG_DOMAIN
})

export const handler = async () => {
  console.log('🔔 send-reminders invoked at', new Date().toISOString())

  // build YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  console.log('⏳ fetching reminders due on', today)

  // grab all incomplete reminders due today
  const { data: reminders, error: fetchErr } = await supabase
    .from('reminders')
    .select('id, note, date, user_id')
    .eq('date', today)
    .eq('completed', false)

  if (fetchErr) {
    console.error('❌ fetch error:', fetchErr)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: fetchErr.message })
    }
  }

  console.log(`📋 found ${reminders.length} reminders to send`)

  const results = []

  for (const r of reminders) {
    // look up the user’s email
    const { data: u, error: uErr } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', r.user_id)
      .single()

    if (uErr || !u?.email) {
      console.error(`❌ could not fetch user ${r.user_id}:`, uErr)
      results.push({ id: r.id, sent: false })
      continue
    }

    const msg = {
      from:    `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
      to:      u.email,
      subject: '⏰ PeerNote Reminder',
      text:    `Reminder: “${r.note}” is due today (${r.date}).`
    }

    try {
      await mg.messages().send(msg)
      console.log(`✉️ sent reminder ${r.id} to ${u.email}`)
      results.push({ id: r.id, sent: true })
    } catch (sendErr) {
      console.error(`❌ mailgun error for ${r.id}:`, sendErr)
      results.push({ id: r.id, sent: false })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results })
  }
}
