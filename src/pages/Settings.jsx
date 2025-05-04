import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth'
import { supabase } from '../supabaseClient'
import { isTrialActive } from '../utils/checkTrialStatus'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [trialStart, setTrialStart] = useState(null)
  const [stripeCustomerId, setStripeCustomerId] = useState(null)

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('users_meta')
        .select('subscribed, trial_start, stripe_customer_id')
        .eq('user_id', userId)
        .single()
      if (!error && data) {
        setSubscribed(data.subscribed)
        setTrialStart(data.trial_start)
        setStripeCustomerId(data.stripe_customer_id)
      } else {
        console.error(error)
      }
      setLoading(false)
    })()
  }, [userId])

  if (loading) {
    return <p className="p-6 text-gray-600">Loading settings…</p>
  }

  // Determine plan label & days remaining
  let planLabel = 'Free'
  let daysLeft = 0
  if (subscribed) {
    planLabel = 'Pro'
  } else if (trialStart) {
    const active = isTrialActive(trialStart)
    planLabel = active ? 'Free (Trial)' : 'Free (Expired)'
    if (active) {
      const msLeft =
        new Date(trialStart).getTime() + 7 * 86400 * 1000 - Date.now()
      daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))
    }
  }

  const handleManage = async () => {
    if (!stripeCustomerId) {
      return alert('No customer on file.')
    }
    const res = await fetch('/.netlify/functions/create-portal-session', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    })
    const { url, error } = await res.json()
    if (error || !url) {
      console.error(error)
      alert('Could not open billing portal.')
    } else {
      window.location.href = url
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div>
        <h2 className="text-lg font-semibold">Your plan</h2>
        <p className="mt-1 text-gray-700">
          {planLabel}
          {planLabel.includes('Trial') &&
            ` — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        </p>
      </div>

      {subscribed ? (
        <button
          onClick={handleManage}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Manage subscription
        </button>
      ) : (
        <button
          onClick={() => navigate('/pricing')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Upgrade to Pro
        </button>
      )}
    </div>
  )
}
