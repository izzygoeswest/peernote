// netlify/functions/send-reminders.js
import mailgun from 'mailgun-js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mg = mailgun({
  apiKey: process.env.MG_API_KEY,
  domain: process.env.MG_DOMAIN,
});

exports.handler = async function(event, context) {
  console.log('🔔 send-reminders invoked at', new Date().toISOString());

  // Determine today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  console.log('⏳ cutoffDate =', today);

  // Fetch all incomplete reminders due today
  const { data: reminders, error: fetchError } = await supabase
    .from('reminders')
    .select('id, note, date, user_id')
    .eq('date', today)
    .eq('completed', false);

  if (fetchError) {
    console.error('❌ Error fetching reminders:', fetchError);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: fetchError.message }),
    };
  }

  console.log(`📋 Found ${reminders.length} pending reminders`);

  const results = [];

  for (const r of reminders) {
    // Lookup the user who set this reminder
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', r.user_id)
      .single();

    if (userError || !userData?.email) {
      console.error(`❌ Could not fetch user email for ID ${r.user_id}:`, userError);
      results.push({ id: r.id, sent: false });
      continue;
    }

    const toAddress = userData.email;
    const emailData = {
      from: `PeerNote <no-reply@${process.env.MG_DOMAIN}>`,
      to: toAddress,
      subject: '⏰ PeerNote Reminder',
      text: `Don't forget: ${r.note} (due ${r.date})`,
    };

    try {
      await mg.messages().send(emailData);
      console.log(`✉️ Sent reminder ${r.id} to ${toAddress}`);
      results.push({ id: r.id, sent: true });
    } catch (sendError) {
      console.error(`❌ Mailgun send error for reminder ${r.id}:`, sendError);
      results.push({ id: r.id, sent: false });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, results }),
  };
};
