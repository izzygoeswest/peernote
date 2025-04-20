import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import Avatar from '../components/Avatar';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalContacts: 0,
    neglectedContacts: 0,
    upcomingReminders: 0,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      setUser(user);

      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, last_interacted')
        .eq('user_id', user.id);

      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, date')
        .eq('user_id', user.id)
        .eq('completed', false);

      const totalContacts = contacts?.length || 0;
      const neglectedContacts = contacts?.filter((contact) => {
        if (!contact.last_interacted) return true;
        return dayjs().diff(dayjs(contact.last_interacted), 'day') > 30;
      }).length;

      const upcomingReminders = reminders?.filter((reminder) =>
        dayjs(reminder.date).isBefore(dayjs().add(7, 'day'))
      ).length;

      setMetrics({
        totalContacts,
        neglectedContacts,
        upcomingReminders,
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {user && <Avatar user={user} />}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading metrics...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">📇 Total Contacts</h2>
            <p className="text-3xl font-bold">{metrics.totalContacts}</p>
          </div>

          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">🔔 Upcoming Reminders</h2>
            <p className="text-3xl font-bold">{metrics.upcomingReminders}</p>
          </div>

          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg font-semibold text-gray-700">⚠️ Neglected Contacts</h2>
            <p className="text-3xl font-bold">{metrics.neglectedContacts}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
