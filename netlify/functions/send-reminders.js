// netlify/functions/send-reminders.js

import mailgun from 'mailgun-js'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin client
// (Ensure SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY are set in Netlify Functions environment)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, detectSessionInUrl: false }
  }
)

// Initialize Mailgun client
// (Ensure MG_API_KEY & MG_DOMAIN are set in Netlify Functions environment)
const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain:  process.env.MG_DOMAIN,
})

export const handler = async () => {
  console.log('🔔 send-reminders invoked at', new Date().toISOString())

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  console.log('⏳ Fetching reminders due on', today)

  // 1) Fetch reminders due today, incomplete, not yet sent,
  //    including contact name via the foreign key relationship
  const { data: reminders, error: fetchError } = await supabaseAdmin
    .from('reminders')
    .select(
      `
      id,
      note,
      date,
      user_id,
      contacts (name)
    `)
    .eq('date',      today)
    .eq('completed', false)
    .eq('sent',      false)

  if (fetchError) {
    console.error('❌ Error fetching reminders:', fetchError)
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: fetchError.message }),
    }
  }

  console.log(`📋 Found ${reminders.length} reminders to process`)

  const results = []

  // Process each reminder
  for (const r of reminders) {
    // 2) Fetch user's notification preference
    const { data: meta, error: metaErr } = await supabaseAdmin
      .from('users_meta')
      .select('notify_reminders')
      .eq('user_id', r.user_id)
      .single()

    if (metaErr) {
      console.error('❌ Could not fetch users_meta for', r.user_id, metaErr)
      results.push({ id: r.id, sent: false })
      continue
    }
    if (!meta.notify_reminders) {
      console.log(`⏭️ Skipping reminder ${r.id}: notifications disabled`)
      results.push({ id: r.id, sent: false, skipped: true })
      continue
    }

    // 3) Lookup user email via Admin API
    const { data: userRec, error: userErr } = await supabaseAdmin.auth.admin.getUserById(r.user_id)
    const userEmail = userRec?.user?.email
    if (userErr || !userEmail) {
      console.error('❌ Could not fetch user email for ID', r.user_id, userErr)
      results.push({ id: r.id, sent: false })
      continue
    }

    // 4) Prepare email content, including contact name
    const contactName = r.contacts?.name || 'your contact'
    const message = {
      from:    `PeerNote <${process.env.FROM_EMAIL}>`,
      to:      userEmail,
      subject: `⏰ Reminder: reach out to ${contactName}`,
      text:    `Hi! Just a reminder to reach out to ${contactName}: “${r.note}” is due today (${r.date}).`,
    }

    // 5) Send email via Mailgun
    try {
      await mg.messages().send(message)
      console.log(`✉️ Sent reminder ${r.id} to ${userEmail}`)

      // 6) Mark reminder as sent
      await supabaseAdmin
        .from('reminders')
        .update({ sent: true })
        .eq('id', r.id)

      results.push({ id: r.id, sent: true })
    } catch (sendErr) {
      console.error(`❌ Mailgun error for reminder ${r.id}:`, sendErr)
      results.push({ id: r.id, sent: false })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results }),
  }
}
