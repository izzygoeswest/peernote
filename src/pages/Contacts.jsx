import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ContactForm from '../components/ContactForm';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (!error) {
      setContacts(data);
      setFiltered(data);
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Delete this contact?');
    if (!confirm) return;

    await supabase.from('contacts').delete().eq('id', id);
    fetchContacts();
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filtered);
  }, [search, contacts]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          onClick={() => {
            setEditingContact(null);
            setShowForm(true);
          }}
        >
          + Add Contact
        </button>
      </div>

      <input
        type="text"
        placeholder="Search contacts..."
        className="w-full mb-4 px-3 py-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No contacts found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((contact) => (
            <div key={contact.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{contact.name}</h2>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  {contact.last_interacted && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last interacted: {new Date(contact.last_interacted).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(contact)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ContactForm
          existingContact={editingContact}
          onClose={() => setShowForm(false)}
          onContactAdded={fetchContacts}
        />
      )}
    </div>
  );
};

export default Contacts;
