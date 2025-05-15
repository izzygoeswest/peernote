// src/pages/Settings.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Settings() {
  const [meta, setMeta] = useState({ subscribed: false, trial_start: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) return
      supabase
        .from('users_meta')
        .select('subscribed, trial_start')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) console.error(error)
          else setMeta(data)
          setLoading(false)
        })
    })
  }, [])

  const managePortal = async () => {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: JSON.stringify({ user_id: supabase.auth.user()?.id }),
    })
    if (error) return console.error(error)
    window.location.href = data.url
  }

  if (loading) return <p>Loading…</p>
  const { subscribed, trial_start } = meta
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl mb-4">Account Settings</h1>
      <p>
        <strong>Plan:</strong> {subscribed ? 'Pro' : 'Free'}
      </p>
      {!subscribed && (
        <p className="text-sm text-gray-600 mb-4">
          {trial_start
            ? `Your trial started ${new Date(trial_start * 1000).toLocaleDateString()}`
            : 'You are on a 7-day free trial.'}
        </p>
      )}
      {subscribed && (
        <button
          onClick={managePortal}
          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Manage Subscription
        </button>
      )}
    </div>
  )
}
