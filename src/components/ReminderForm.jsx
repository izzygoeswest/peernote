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

  // load contacts for dropdown
  useEffect(() => {
    supabase
      .from('contacts')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true })
      .then(({ data }) => setContacts(data || []))
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
        .insert([{ user_id: userId, contact_id: contactId, date, note }])
    }

    setSaving(false)
    onReminderAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-white h-full shadow-lg p-6 overflow-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {existingReminder ? 'Edit Reminder' : 'Add Reminder'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact */}
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

          {/* Date */}
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

          {/* Note */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 text-white w-full py-2 rounded hover:bg-purple-700"
          >
            {saving
              ? 'Saving…'
              : existingReminder
              ? 'Update Reminder'
              : 'Save Reminder'}
          </button>
        </form>
      </div>

      {/* Click-outside overlay to close */}
      <div className="flex-1" onClick={onClose} />
    </div>
  )
}
