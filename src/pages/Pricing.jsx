import React from 'react';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

const Pricing = () => {
  const handleCheckout = async () => {
    const { data: user } = await supabase.auth.getUser();

    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: user?.user?.id }),
    });

    const { url } = await res.json();
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

    await stripe.redirectToCheckout({ sessionId: url });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 text-center">
      <h1 className="text-4xl font-bold mb-4">Upgrade to PeerNote Pro</h1>
      <p className="text-lg mb-8 text-gray-600">Start with a 7-day free trial. Then just $5/month. Cancel anytime.</p>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2">PeerNote Pro</h2>
        <p className="text-gray-600 mb-4">Includes full access to contacts, reminders, follow-up tracking, and more.</p>
        <button
          onClick={handleCheckout}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Start Free Trial
        </button>
      </div>
    </div>
  );
};

export default Pricing;
