import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../auth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Pricing = () => {
  const { session } = useAuth();

  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: session?.user?.id }),
    });

    const data = await response.json();

    if (!data.sessionId) {
      console.error('Failed to create checkout session:', data);
      alert('Could not start checkout.');
      return;
    }

    stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-xl p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">Upgrade to PeerNote Pro</h1>
        <p className="mb-6 text-gray-600">$5/month after a 7-day free trial</p>

        <ul className="text-left list-disc list-inside text-sm text-gray-700 mb-6">
          <li>Unlimited contacts</li>
          <li>Reminders & follow-ups</li>
          <li>Progress tracking</li>
          <li>Priority support</li>
        </ul>

        <button
          onClick={handleCheckout}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-purple-700 transition"
        >
          Start Free Trial
        </button>

        <p className="mt-4 text-xs text-gray-400">Cancel anytime. No questions asked.</p>
      </div>
    </div>
  );
};

export default Pricing;
