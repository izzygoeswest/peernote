// netlify/functions/send-reminders.js

import { createClient } from '@supabase/supabase-js';
import mailgun from 'mailgun-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN,
});

export async function handler() {
  try {
    // 1️⃣ Fetch all due, uncompleted reminders opted into email
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        id,
        date,
        note,
        contacts (
          id,
          email,
          name
        ),
        users_meta (
          trial_start,
          subscribed
        )
      `)
      .lte('date', new Date().toISOString())
      .eq('completed', false)
      .eq('notify_email', true);

    if (error) throw error;

    // 2️⃣ Filter out anyone whose trial is expired and unsubscribed
    const now = new Date();
    const toSend = reminders.filter(r => {
      const { trial_start, subscribed } = r.users_meta || {};
      // if subscribed, always send
      if (subscribed) return true;
      // else require trial_start within 7 days
      return (
        trial_start &&
        (now - new Date(trial_start)) / (1000 * 60 * 60 * 24) < 7
      );
    });

    // 3️⃣ Send an email per reminder
    await Promise.all(
      toSend.map(({ id, date, note, contacts: { email, name } }) => {
        const formatted = new Date(date).toLocaleString();
        const msg = {
          from: `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
          to: email,
          subject: `🔔 Reminder: ${note || 'Upcoming reminder'}`,
          text: `Hey ${name || ''},\n\nThis is a reminder scheduled for ${formatted}.\n\n— PeerNote`,
        };
        return mg.messages().send(msg);
      })
    );

    return {
      statusCode: 200,
      body: `✅ Sent ${toSend.length} reminder email(s).`,
    };
  } catch (err) {
    console.error('send-reminders error:', err);
    return { statusCode: 500, body: err.message };
  }
}
