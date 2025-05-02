import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { FiX } from 'react-icons/fi'
import { useAuth } from '../auth'

export default function ReminderForm({ existingReminder, onClose, onReminderAdded }) {
  const { session } = useAuth()
  const userId = session.user.id

  const [contacts, setContacts]     = useState([])
  const [contactId, setContactId]   = useState(existingReminder?.contact_id || '')
  const [date, setDate]             = useState(existingReminder?.date || '')
  const [note, setNote]             = useState(existingReminder?.note || '')
  const [saving, setSaving]         = useState(false)

  // load your contacts for the dropdown
  useEffect(() => {
    supabase
      .from('contacts')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setContacts(data)
      })
  }, [userId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (existingReminder) {
      await supabase
        .from('reminders')
        .update({ contact_id: contactId, date, note })
        .eq('id', existingReminder.id)
    } else {
      await supabase
        .from('reminders')
        .insert([
          { user_id: userId, contact_id: contactId, date, note }
        ])
    }

    setSaving(false)
    onReminderAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {existingReminder ? 'Edit Reminder' : 'Add Reminder'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact selector */}
          <div>
            <label className="block text-sm font-medium">Contact</label>
            <select
              className="w-full px-3 py-2 border rounded"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              required
            >
              <option value="">Choose a contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date input */}
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Note input */}
          <div>
            <label className="block text-sm font-medium">Note</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700"
          >
            {saving ? 'Saving…' : existingReminder ? 'Update Reminder' : 'Save Reminder'}
          </button>
        </form>
      </div>
    </div>
  )
}
