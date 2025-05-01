// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth';
import dayjs from 'dayjs';

export default function Dashboard() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [totalContacts, setTotalContacts] = useState(0);
  const [upcomingReminders, setUpcomingReminders] = useState(0);
  const [neglectedContacts, setNeglectedContacts] = useState(0);

  // Fetch counts
  const fetchContacts = async () => {
    const { count } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    setTotalContacts(count ?? 0);
  };

  const fetchReminders = async () => {
    const today = dayjs().format('YYYY-MM-DD');
    const { count } = await supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('date', today);
    setUpcomingReminders(count ?? 0);
  };

  const fetchNeglected = async () => {
    const cutoff = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    const { count } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lt('last_interacted', cutoff);
    setNeglectedContacts(count ?? 0);
  };

  useEffect(() => {
    if (!userId) return;
    fetchContacts();
    fetchReminders();
    fetchNeglected();

    // Realtime subscriptions
    const remindersSub = supabase
      .from(`reminders:user_id=eq.${userId}`)
      .on('*', fetchReminders)
      .subscribe();

    const contactsSub = supabase
      .from(`contacts:user_id=eq.${userId}`)
      .on('*', () => {
        fetchContacts();
        fetchNeglected();
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(remindersSub);
      supabase.removeSubscription(contactsSub);
    };
  }, [userId]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-6">
        {/* Total Contacts */}
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-lg font-medium">Total Contacts</p>
          <p className="text-3xl">{totalContacts}</p>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-lg font-medium">Upcoming Reminders</p>
          <p className="text-3xl">{upcomingReminders}</p>
        </div>

        {/* Neglected Contacts */}
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-lg font-medium">Neglected Contacts</p>
          <p className="text-3xl">{neglectedContacts}</p>
        </div>
      </div>
    </div>
  );
}
