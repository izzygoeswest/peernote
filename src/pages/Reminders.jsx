import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth'
import dayjs from 'dayjs'
import ReminderForm from '../components/ReminderForm'

export default function Reminders() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [reminders, setReminders]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showForm, setShowForm]               = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)

  const fetchReminders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reminders')
      .select('id, note, date, completed, contacts(id, name)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (!error) setReminders(data)
    setLoading(false)
  }

  const toggleCompleted = async (id, completed) => {
    await supabase
      .from('reminders')
      .update({ completed: !completed })
      .eq('id', id)
    fetchReminders()
  }

  useEffect(() => {
    if (userId) fetchReminders()
  }, [userId])

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <button
          onClick={() => { setEditingReminder(null); setShowForm(true) }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          + Add Reminder
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading reminders…</p>
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
      )}

      {showForm && (
        <ReminderForm
          existingReminder={editingReminder}
          onClose={() => setShowForm(false)}
          onReminderAdded={fetchReminders}
        />
      )}
    </div>
  )
}
