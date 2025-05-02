// netlify/functions/send-reminders.js

import mailgun from 'mailgun-js'
import { createClient } from '@supabase/supabase-js'

// 1) Supabase admin client with SERVICE_ROLE_KEY
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// 2) Mailgun client
const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN,
})

export const handler = async () => {
  // today in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // 3) fetch all incomplete reminders due *today*
  const { data: dueReminders, error: fetchError } = await supabaseAdmin
    .from('reminders')
    .select('id, note, date, user_id')
    .eq('date', today)
    .eq('completed', false)

  if (fetchError) {
    console.error('❌ Error fetching reminders:', fetchError)
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: fetchError.message }),
    }
  }

  // 4) send one email per reminder
  const results = await Promise.all(
    dueReminders.map(async (r) => {
      // lookup the user’s email
      const { data: userRec, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', r.user_id)
        .single()

      if (userError || !userRec?.email) {
        console.error('❌ Could not fetch user email for', r.user_id, userError)
        return { id: r.id, sent: false }
      }

      const message = {
        from: `PeerNote <no-reply@mg.peernote.app>`,
        to: userRec.email,
        subject: `🔔 Reminder: ${r.note}`,
        text: `Hi there! Don’t forget: “${r.note}” scheduled for ${r.date}.`,
      }

      return new Promise((resolve) => {
        mg.messages().send(message, (err/*MailgunError*/, body/*Response*/) => {
          if (err) {
            console.error('❌ Mailgun error for reminder', r.id, err)
            resolve({ id: r.id, sent: false })
          } else {
            resolve({ id: r.id, sent: true })
          }
        })
      })
    })
  )

  // 5) return a summary
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results }),
  }
}
