import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import dayjs from 'dayjs';
import ReminderForm from '../components/ReminderForm';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const fetchReminders = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('reminders')
      .select('id, date, note, completed, contact_id, contacts(name)')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (!error) {
      setReminders(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const markCompleted = async (id) => {
    await supabase.from('reminders').update({ completed: true }).eq('id', id);
    fetchReminders();
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Delete this reminder?');
    if (!confirm) return;

    await supabase.from('reminders').delete().eq('id', id);
    fetchReminders();
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          onClick={() => {
            setEditingReminder(null);
            setShowForm(true);
          }}
        >
          + Add Reminder
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reminders.length === 0 ? (
        <p className="text-gray-400">No reminders found.</p>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white p-4 rounded shadow flex justify-between items-start ${
                reminder.completed ? 'opacity-60' : ''
              }`}
            >
              <div>
                <h2 className="font-semibold">
                  {reminder.contacts?.name || 'Unknown Contact'}
                </h2>
                <p className="text-sm text-gray-500">
                  {dayjs(reminder.date).format('MMMM D, YYYY')}
                </p>
                {reminder.note && (
                  <p className="mt-1 text-gray-700 text-sm">{reminder.note}</p>
                )}
              </div>
              <div className="text-right space-y-1">
                {!reminder.completed && (
                  <button
                    onClick={() => markCompleted(reminder.id)}
                    className="block text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Mark Complete
                  </button>
                )}
                <button
                  onClick={() => handleEdit(reminder)}
                  className="block text-blue-500 text-sm hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="block text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ReminderForm
          existingReminder={editingReminder}
          onClose={() => setShowForm(false)}
          onReminderAdded={fetchReminders}
        />
      )}
    </div>
  );
};

export default Reminders;
