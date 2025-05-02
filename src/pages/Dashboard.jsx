// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth'
import dayjs from 'dayjs'
import { FiUsers, FiBell } from 'react-icons/fi'

export default function Dashboard() {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [totalContacts, setTotalContacts] = useState(0)
  const [upcomingReminders, setUpcomingReminders] = useState(0)

  const fetchContacts = async () => {
    const { count } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    setTotalContacts(count ?? 0)
  }

  const fetchReminders = async () => {
    const today = dayjs().format('YYYY-MM-DD')
    const { count } = await supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('date', today)
    setUpcomingReminders(count ?? 0)
  }

  useEffect(() => {
    if (!userId) return
    fetchContacts()
    fetchReminders()

    const remindersChannel = supabase
      .channel(`reminders_user_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${userId}` },
        fetchReminders
      )
      .subscribe()

    return () => {
      supabase.removeChannel(remindersChannel)
    }
  }, [userId])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow text-center space-y-2">
          <FiUsers className="mx-auto w-8 h-8 text-purple-600" />
          <p className="text-lg font-medium">Total Contacts</p>
          <p className="text-3xl">{totalContacts}</p>
        </div>

        <div className="bg-white p-6 rounded shadow text-center space-y-2">
          <FiBell className="mx-auto w-8 h-8 text-purple-600" />
          <p className="text-lg font-medium">Upcoming Reminders</p>
          <p className="text-3xl">{upcomingReminders}</p>
        </div>
      </div>
    </div>
  )
}
