// netlify/functions/send-reminders.js
import mailgun from 'mailgun-js'
import { createClient } from '@supabase/supabase-js'

const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN,
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const handler = async () => {
  console.log('🔔 send-reminders invoked at', new Date().toISOString())

  // 1) fetch all not-yet-completed reminders whose date ≤ now,
  //    and grab the contact's email via the FK to contacts.id
  const now = new Date().toISOString()
  const { data: reminders, error: fetchError } = await supabase
    .from('reminders')
    .select('id, note, date, contacts(email)')
    .eq('completed', false)
    .lte('date', now)

  console.log('Fetched reminders:', reminders, 'fetchError:', fetchError)
  if (fetchError) {
    console.error('Error fetching reminders:', fetchError)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: fetchError.message }),
    }
  }

  // 2) for each reminder, send an email
  const results = await Promise.all(
    reminders.map(async (r) => {
      const to = r.contacts?.email
      if (!to) {
        console.warn(`Reminder ${r.id} has no contact email, skipping`)
        return { id: r.id, sent: false, reason: 'no-email' }
      }

      const msg = {
        from: `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
        to,
        subject: '⏰ PeerNote Reminder',
        text: `Don’t forget: ${r.note} (due ${r.date})`,
      }

      try {
        await mg.messages().send(msg)
        console.log(`✉️  Sent reminder ${r.id} to ${to}`)
        return { id: r.id, sent: true }
      } catch (mailErr) {
        console.error(`❌  Mailgun error sending ${r.id} to ${to}:`, mailErr)
        return { id: r.id, sent: false, reason: mailErr.message }
      }
    })
  )

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results }),
  }
}
