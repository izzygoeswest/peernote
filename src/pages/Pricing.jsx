// src/pages/Pricing.jsx
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../auth';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const tiers = [
  {
    name: 'Free',
    price: '$0',
    features: ['Track up to 25 contacts', 'Basic reminders & notes', 'Community support'],
    cta: 'Sign Up Free',
    action: () => window.location.assign('/signup'),
    featured: false,
  },
  {
    name: 'Pro',
    price: '$5/mo',
    features: [
      'Unlimited contacts',
      'Advanced reminders & tags',
      'Export to Excel',
      'Email notifications',
    ],
    cta: 'Upgrade to Pro',
    action: async () => {
      const stripe = await stripePromise;
      const resp = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: (await import('../auth')).useAuth().session.user.id }),
      });
      const data = await resp.json();
      if (data.sessionId) {
        stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert('Could not start checkout.');
        console.error(data);
      }
    },
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: ['Dedicated account manager','Custom integrations','Priority support'],
    cta: 'Contact Sales',
    action: () => window.location.assign('/contact'),
    featured: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="mt-4 text-gray-600">Start with a 7-day free trial of Pro. No credit card required.</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`border rounded-lg p-6 flex flex-col ${
              tier.featured ? 'ring-2 ring-blue-500 bg-white' : 'bg-white'
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">{tier.name}</h2>
            <p className="text-4xl font-bold mb-6">{tier.price}</p>
            <ul className="space-y-2 flex-1 mb-6 text-gray-700">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-center">
                  <span className="mr-2 text-blue-500">✔️</span>
                  {feat}
                </li>
              ))}
            </ul>
            <button
              onClick={tier.action}
              className={`mt-auto py-2 rounded text-white font-medium ${
                tier.featured ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
