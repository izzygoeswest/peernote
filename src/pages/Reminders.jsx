// src/pages/Reminders.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth'
import dayjs from 'dayjs'
import { FiX, FiTrash2 } from 'react-icons/fi'

export default function Reminders() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [reminders, setReminders] = useState([])
  const [contacts, setContacts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [newNote, setNewNote]       = useState('')
  const [newDate, setNewDate]       = useState('')
  const [newContact, setNewContact] = useState('')

  // Fetch reminders
  const fetchReminders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reminders')
      .select('id, note, date, completed, contacts(id, name)')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) console.error('Error fetching reminders:', error)
    else setReminders(data)
    setLoading(false)
  }

  // Fetch contacts for the dropdown
  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('user_id', userId)
      .order('name', { ascending: true })
    if (error) console.error('Error fetching contacts:', error)
    else setContacts(data)
  }

  useEffect(() => {
    if (userId) {
      fetchContacts()
      fetchReminders()
    }
  }, [userId])

  // Toggle completed/uncompleted
  const toggleCompleted = async (id, completed) => {
    const { error } = await supabase
      .from('reminders')
      .update({ completed: !completed })
      .eq('id', id)
    if (error) console.error('Error updating reminder:', error)
    else fetchReminders()
  }

  // Delete a reminder
  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
    if (error) console.error('Error deleting reminder:', error)
    else fetchReminders()
  }

  // Add a new reminder
  const handleAddReminder = async (e) => {
    e.preventDefault()
    if (!newNote || !newDate || !newContact) return
    setAdding(true)
    const { error } = await supabase
      .from('reminders')
      .insert([
        {
          user_id:    userId,
          note:       newNote,
          date:       newDate,
          contact_id: newContact
        }
      ])
    if (error) console.error('Error adding reminder:', error)
    else {
      setNewNote('')
      setNewDate('')
      setNewContact('')
      setShowModal(false)
      fetchReminders()
    }
    setAdding(false)
  }

  if (loading) {
    return <p className="text-gray-600">Loading reminders…</p>
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          + Add Reminder
        </button>
      </div>

      {/* List */}
      {reminders.length === 0 ? (
        <p className="text-gray-400">No reminders yet.</p>
      ) : (
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

              <div className="flex items-center space-x-2">
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

                <button
                  onClick={() => handleDeleteReminder(r.id)}
                  title="Delete reminder"
                  className="p-1 text-red-500 hover:text-red-600"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Reminder</h2>
            <form onSubmit={handleAddReminder} className="space-y-4">
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
                  <option value="">Select contact</option>
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
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {adding ? 'Saving…' : 'Save Reminder'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
