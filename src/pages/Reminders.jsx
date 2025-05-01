// src/pages/Reminders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth';
import dayjs from 'dayjs';

export default function Reminders() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch all reminders for this user
  const fetchReminders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reminders')
      .select(`
        id,
        note,
        date,
        completed,
        contacts (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching reminders:', error);
    } else {
      setReminders(data);
    }
    setLoading(false);
  };

  // on mount & whenever userId changes
  useEffect(() => {
    if (userId) fetchReminders();
  }, [userId]);

  // toggle a reminder's completed flag
  const toggleCompleted = async (id, currentlyCompleted) => {
    const { error } = await supabase
      .from('reminders')
      .update({ completed: !currentlyCompleted })
      .eq('id', id);

    if (error) {
      console.error('Error updating reminder:', error);
    } else {
      // reload the list (and Dashboard count will update)
      fetchReminders();
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading reminders…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reminders</h1>

      <ul className="space-y-4">
        {reminders.map((r) => (
          <li
            key={r.id}
            className={`flex items-center justify-between p-4 border rounded ${
              r.completed ? 'opacity-50' : ''
            }`}
          >
            <div>
              <p className="text-sm text-gray-500">
                {dayjs(r.date).format('YYYY-MM-DD')}
              </p>
              <p className="font-medium">{r.note}</p>
              <p className="text-sm text-gray-600">
                Contact: {r.contacts?.name || '—'}
              </p>
            </div>
            <button
              onClick={() => toggleCompleted(r.id, r.completed)}
              className={`px-3 py-1 rounded text-sm ${
                r.completed
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {r.completed ? 'Mark Active' : 'Mark Complete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
