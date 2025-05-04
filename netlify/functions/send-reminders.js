// netlify/functions/send-reminders.js

import mailgun from 'mailgun-js'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, detectSessionInUrl: false } }
)

// Initialize Mailgun client
const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain:  process.env.MG_DOMAIN,
})

export const handler = async () => {
  console.log('🔔 send-reminders invoked at', new Date().toISOString())

  // Today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // Fetch reminders due today, incomplete, not yet sent,
  // including each user's notification preference and contact name
  const { data: dueReminders, error: fetchError } = await supabaseAdmin
    .from('reminders')
    .select(
      `
      id,
      note,
      date,
      user_id,
      contacts (
        name
      ),
      users_meta:users_meta!reminders_user_id_fkey (
        notify_reminders
      )
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

  console.log(`📋 Found ${dueReminders.length} reminders to process`)

  const results = []

  for (const r of dueReminders) {
    // Skip if user opted out of email reminders
    if (!r.users_meta?.notify_reminders) {
      console.log(`⏭️ Skipping reminder ${r.id}: user opted out`)
      results.push({ id: r.id, sent: false, skipped: true })
      continue
    }

    // Lookup the user's email via Admin API
    const { data: userRec, error: userErr } = await supabaseAdmin.auth.admin.getUserById(r.user_id)
    const userEmail = userRec?.user?.email

    if (userErr || !userEmail) {
      console.error('❌ Could not fetch user email for ID', r.user_id, userErr)
      results.push({ id: r.id, sent: false })
      continue
    }

    const contactName = r.contacts?.name || 'your contact'

    // Prepare and send the email
    const message = {
      from:    `PeerNote <${process.env.FROM_EMAIL}>`,
      to:      userEmail,
      subject: `⏰ Reminder: reach out to ${contactName}`,
      text:    `Hi! Just a reminder to reach out to ${contactName}: “${r.note}” is due today (${r.date}).`,
    }

    try {
      await mg.messages().send(message)
      console.log(`✉️ Sent reminder ${r.id} to ${userEmail}`)

      // Mark reminder as sent
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
