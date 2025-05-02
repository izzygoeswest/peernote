// netlify/functions/send-reminders.js

import mailgun from 'mailgun-js';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

// Initialize Mailgun
const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN,
});

// Service-role Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async () => {
  console.log('🔔 send-reminders invoked at', new Date().toISOString());

  // Use date-only filter (YYYY-MM-DD)
  const cutoffDate = dayjs().format('YYYY-MM-DD');
  console.log('⏳ cutoffDate =', cutoffDate);

  // Grab all incomplete reminders due today or earlier
  const { data: reminders, error: fetchError } = await supabase
    .from('reminders')
    .select('id, note, date, contacts(email)')
    .eq('completed', false)
    .lte('date', cutoffDate);

  console.log('Fetched reminders:', reminders, ' error:', fetchError);
  if (fetchError) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: fetchError.message }),
    };
  }

  if (!reminders.length) {
    console.log('No reminders to send.');
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, count: 0 }),
    };
  }

  // Send one email per reminder
  const sendResults = await Promise.all(
    reminders.map(async (r) => {
      const to = r.contacts?.email;
      console.log(`→ preparing to mail reminder ${r.id} to ${to}`);
      if (!to) {
        console.warn(`Reminder ${r.id} has no contact.email, skipping`);
        return { id: r.id, sent: false, reason: 'no-contact-email' };
      }

      try {
        await mg.messages().send({
          from: `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
          to,
          subject: '⏰ PeerNote Reminder',
          text: `Don’t forget: ${r.note} (due ${r.date})`,
        });
        console.log(`✉️ Sent reminder ${r.id}`);
        return { id: r.id, sent: true };
      } catch (mailErr) {
        console.error(`❌ Mailgun error for ${r.id}:`, mailErr);
        return { id: r.id, sent: false, reason: mailErr.message };
      }
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results: sendResults }),
  };
};
