import React from 'react';
import { useAuth } from '../auth';

const Pricing = () => {
  const { session } = useAuth();

  const handleCheckout = async () => {
    // 1) Must be logged in
    if (!session?.user?.id) {
      alert("Please log in to upgrade.");
      return;
    }

    let stripe;
    try {
      // 2) Dynamically import Stripe on demand
      const { loadStripe } = await import('@stripe/stripe-js');
      stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    } catch (err) {
      console.error('Stripe.js load failed:', err);
      alert('Upgrade feature is temporarily unavailable.');
      return;
    }

    try {
      // 3) Create a Checkout Session on your Netlify function
      const resp = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id }),
      });
      const data = await resp.json();

      if (!data.sessionId) {
        console.error('Checkout session error:', data);
        alert('Could not start checkout.');
        return;
      }

      // 4) Redirect to Stripe Checkout
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Could not start checkout.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Upgrade to Pro</h1>
        <button
          onClick={handleCheckout}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

export default Pricing;
