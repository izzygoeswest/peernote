import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ContactForm = ({ onClose, onContactAdded, existingContact }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    last_interacted: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingContact) {
      setFormData({
        name: existingContact.name || '',
        email: existingContact.email || '',
        last_interacted: existingContact.last_interacted || '',
      });
    }
  }, [existingContact]);

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
    if (existingContact) {
      // EDIT
      ({ error } = await supabase
        .from('contacts')
        .update({ ...formData })
        .eq('id', existingContact.id));
    } else {
      // ADD
      ({ error } = await supabase.from('contacts').insert([
        {
          ...formData,
          user_id: user.id,
        },
      ]));
    }

    setLoading(false);
    if (!error) {
      onContactAdded();
      onClose();
    } else {
      alert('Error saving contact: ' + error.message);
    }
  };

  return (
    <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 p-6 overflow-y-auto transition-transform duration-300 transform translate-x-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {existingContact ? 'Edit Contact' : 'Add Contact'}
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
          <label className="block text-sm">Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Email</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm">Last Interacted (optional)</label>
          <input
            type="date"
            name="last_interacted"
            value={formData.last_interacted}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          {loading ? 'Saving...' : existingContact ? 'Update Contact' : 'Save Contact'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
