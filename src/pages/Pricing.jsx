// src/pages/Pricing.jsx
import React from 'react';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

const Pricing = () => {
  const handleCheckout = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData?.user?.id;

    if (!user_id) {
      alert('You must be logged in to start a subscription.');
      return;
    }

    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    });

    const { sessionId } = await res.json();

    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    if (!stripe || !sessionId) {
      alert('There was an error starting checkout.');
      return;
    }

    await stripe.redirectToCheckout({ sessionId });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Upgrade to PeerNote Pro</h1>
      <p className="text-lg text-gray-600 mb-6">
        Start free for 7 days. Then only $5/month.
      </p>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2">PeerNote Pro</h2>
        <p className="text-gray-500 mb-4">Unlimited contacts, reminders, and follow-ups.</p>
        <button
          onClick={handleCheckout}
          className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
        >
          Start Free Trial
        </button>
      </div>
    </div>
  );
};

export default Pricing;
