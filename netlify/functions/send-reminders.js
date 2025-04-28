import { createClient } from '@supabase/supabase-js';
import mailgun from 'mailgun-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const mg = mailgun({ apiKey: process.env.MG_API_KEY, domain: process.env.MG_DOMAIN });

export async function handler() {
  try {
    // Fetch due, uncompleted reminders opted into email
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(
        `
          id,
          date,
          note,
          completed,
          notify_email,
          contacts (
            email,
            name
          ),
          users_meta (
            trial_start,
            subscribed
          )
        `
      )
      .lte('date', new Date().toISOString())
      .eq('completed', false)
      .eq('notify_email', true);

    if (error) throw error;

    const now = new Date();
    const toSend = reminders.filter(r => {
      if (r.users_meta?.subscribed) return true;
      const diffDays = (now - new Date(r.users_meta?.trial_start)) / (1000*60*60*24);
      return diffDays < 7;
    });

    await Promise.all(
      toSend.map(({ date, note, contacts: { email, name } }) => {
        const formattedDate = new Date(date).toLocaleString();
        const msg = {
          from: `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
          to: email,
          subject: `🔔 Reminder: ${note || 'Upcoming reminder'}`,
          text: `Hello ${name || ''},\n\nYou have a reminder scheduled for ${formattedDate}.\n\n— PeerNote`,
        };
        return mg.messages().send(msg);
      })
    );

    return { statusCode: 200, body: `✅ Sent ${toSend.length} reminder email(s).` };
  } catch (err) {
    console.error('send-reminders error:', err);
    return { statusCode: 500, body: err.message };
  }
}
