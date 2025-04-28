import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [totalContacts, setTotalContacts] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [neglectedContacts, setNeglectedContacts] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' });
      setTotalContacts(contactCount);

      const { count: reminderCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact' });
      setUpcomingReminders(reminderCount);

      // Your existing “neglected” logic goes here…
      setNeglectedContacts(0);
    }
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">📇 Total Contacts</h3>
        <p className="text-2xl">{totalContacts}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">🔔 Upcoming Reminders</h3>
        <p className="text-2xl">{upcomingReminders}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">⚠️ Neglected Contacts</h3>
        <p className="text-2xl">{neglectedContacts}</p>
      </div>
    </div>
  );
}
