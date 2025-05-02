// src/pages/Reminders.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth';
import dayjs from 'dayjs';

export default function Reminders() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [reminders, setReminders] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newContact, setNewContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

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
    if (error) console.error('Error fetching reminders:', error);
    else setReminders(data);
    setLoading(false);
  };

  // fetch contacts list for dropdown
  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    if (error) console.error('Error fetching contacts:', error);
    else setContacts(data);
  };

  // add a new reminder
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newNote || !newDate || !newContact) return;
    setAdding(true);
    const { error } = await supabase
      .from('reminders')
      .insert([{ user_id: userId, note: newNote, date: newDate, contact_id: newContact }]);
    if (error) console.error('Error adding reminder:', error);
    else {
      setNewNote('');
      setNewDate('');
      setNewContact('');
      fetchReminders();
    }
    setAdding(false);
  };

  useEffect(() => {
    if (userId) {
      fetchContacts();
      fetchReminders();
    }
  }, [userId]);

  if (loading) {
    return <p className="text-gray-600">Loading reminders…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reminders</h1>

      {/* Add Reminder Form */}
      <form
        onSubmit={handleAddReminder}
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
      >
        <div>
          <label className="block text-sm font-medium">Note</label>
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contact</label>
          <select
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Select</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {adding ? 'Adding…' : 'Add Reminder'}
        </button>
      </form>

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
              onClick={() =>
                toggleCompleted(r.id, r.completed)
              }
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

// Note: toggleCompleted function remains below
const toggleCompleted = async (id, currentlyCompleted) => {
  const { error } = await supabase
    .from('reminders')
    .update({ completed: !currentlyCompleted })
    .eq('id', id);

  if (error) {
    console.error('Error updating reminder:', error);
  } else {
    // reload the list
    fetchReminders();
  }
};
