import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your real Stripe publishable key
const stripePromise = loadStripe('pk_test_51RFpbxRXDDeRwNbpfHewihmM5uSVvD2W7rIC83G0U6L98JnpnWRWsPNhvci7GARIG5K86XyIsmo1NKVxNh4LZr0800kzX6rJm9');

const Pricing = () => {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'peer-pro' }), // optional payload if needed
    });

    const session = await response.json();
    const result = await stripe.redirectToCheckout({ sessionId: session.id });

    if (result.error) {
      alert(result.error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center bg-white shadow rounded mt-10">
      <h1 className="text-3xl font-bold mb-6">Upgrade to PeerNote Pro</h1>

      <div className="bg-gray-100 p-6 rounded">
        <h2 className="text-xl font-semibold mb-2">PeerNote Pro</h2>
        <p className="text-gray-600 mb-4">Unlimited contacts, reminders, and priority support.</p>
        <p className="text-2xl font-bold mb-4">$5/month</p>

        <button
          onClick={handleCheckout}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
};

export default Pricing;
