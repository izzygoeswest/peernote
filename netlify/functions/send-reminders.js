// netlify/functions/send-reminders.js
import mailgun from 'mailgun-js'
import { createClient } from '@supabase/supabase-js'

// admin client (service role)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, detectSessionInUrl: false } }
)

// mailgun client
const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN,
})

export const handler = async () => {
  console.log('🔔 send-reminders invoked at', new Date().toISOString())

  const today = new Date().toISOString().split('T')[0]
  console.log('⏳ Fetching reminders due on', today)

  const { data: reminders, error: fetchError } = await supabaseAdmin
    .from('reminders')
    .select('id, note, date, user_id, contacts(name)')   // pull in contact name too
    .eq('date', today)
    .eq('completed', false)

  if (fetchError) {
    console.error('❌ Error fetching reminders:', fetchError)
    return { statusCode: 500, body: fetchError.message }
  }
  console.log(`📋 Found ${reminders.length} reminders to process`)

  const results = []

  for (const r of reminders) {
    // get the owner user’s email
    const {
      data: userData,
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(r.user_id)

    if (userError || !userData.user?.email) {
      console.error('❌ Could not fetch user email for ID', r.user_id, userError)
      results.push({ id: r.id, sent: false })
      continue
    }

    const userEmail = userData.user.email
    const contactName = r.contacts?.name || 'your contact'

    const message = {
      from: `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
      to: userEmail,
      subject: `⏰ Reminder: ${r.note}`,
      text: `Hi there!\n\nThis is a reminder that "${r.note}" (for: ${contactName}) is due today (${r.date}).\n\n— PeerNote`,
    }

    try {
      await mg.messages().send(message)
      console.log(`✉️ Sent reminder ${r.id} to ${userEmail}`)
      results.push({ id: r.id, sent: true })
    } catch (sendError) {
      console.error(`❌ Mailgun send error for ${r.id}:`, sendError)
      results.push({ id: r.id, sent: false })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results }),
  }
}
