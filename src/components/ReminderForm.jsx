import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ReminderForm = ({ onClose, onReminderAdded, existingReminder }) => {
  const [formData, setFormData] = useState({
    contact_id: '',
    date: '',
    note: '',
  });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    setContacts(data || []);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (existingReminder) {
      setFormData({
        contact_id: existingReminder.contact_id || '',
        date: existingReminder.date || '',
        note: existingReminder.note || '',
      });
    }
  }, [existingReminder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    let error;

    if (existingReminder) {
      ({ error } = await supabase
        .from('reminders')
        .update({ ...formData })
        .eq('id', existingReminder.id));
    } else {
      ({ error } = await supabase.from('reminders').insert([
        {
          ...formData,
          user_id: user.id,
          completed: false,
        },
      ]));
    }

    setLoading(false);
    if (!error) {
      onReminderAdded();
      onClose();
    } else {
      alert('Error saving reminder: ' + error.message);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 p-6 overflow-y-auto transition-transform duration-300 transform translate-x-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {existingReminder ? 'Edit Reminder' : 'Add Reminder'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-xl font-bold"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Contact</label>
          <select
            name="contact_id"
            value={formData.contact_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm">Note</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          {loading ? 'Saving...' : existingReminder ? 'Update Reminder' : 'Save Reminder'}
        </button>
      </form>
    </div>
  );
};

export default ReminderForm;
