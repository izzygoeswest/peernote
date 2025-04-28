import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="bg-white text-gray-900">
      {/* Top Login Link */}
      <div className="w-full max-w-6xl mx-auto flex justify-end p-4">
        <Link to="/login" className="text-purple-600 font-medium hover:underline">
          Login
        </Link>
      </div>

      {/* Hero Section */}
      <section className="text-center py-28 px-4 bg-white relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            The Contact Manager <span className="text-purple-600">You’ll Actually Use</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Say goodbye to spreadsheets and sticky notes. PeerNote keeps you connected, organized, and in control of your network.
          </p>
          <Link
            to="/signup"
            className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 shadow-md"
          >
            Start Free Trial
          </Link>
        </motion.div>
      </section>

      {/* Features Grid in Light Gray */}
      <section className="bg-gray-50 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Why PeerNote Works for Real Life</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white p-6 rounded-xl shadow border transform hover:-translate-y-1 transition">
              <h3 className="text-xl font-semibold mb-2">Easy</h3>
              <p className="text-gray-600">No tutorials required. Just log in and start tracking your network like a pro.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border transform hover:-translate-y-1 transition">
              <h3 className="text-xl font-semibold mb-2">Intuitive</h3>
              <p className="text-gray-600">We designed PeerNote to think like you do — fluid, fast, and focused.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border transform hover:-translate-y-1 transition">
              <h3 className="text-xl font-semibold mb-2">Clean</h3>
              <p className="text-gray-600">Enjoy a beautiful, distraction-free workspace that keeps you in flow.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border transform hover:-translate-y-1 transition">
              <h3 className="text-xl font-semibold mb-2">Built for Busy People</h3>
              <p className="text-gray-600">Add contacts in seconds. Automate your reminders. Free up your brain.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border transform hover:-translate-y-1 transition">
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your data is yours alone. PeerNote respects your privacy, always.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border transform hover:-translate-y-1 transition">
              <h3 className="text-xl font-semibold mb-2">Always Accessible</h3>
              <p className="text-gray-600">Your contacts go with you. Desktop or mobile, you’re always in sync.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Screenshot Features */}
      <section className="py-20 px-6 bg-white">
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img src="/screenshots/dashboard.png" alt="Dashboard" className="rounded-2xl shadow-2xl border max-w-full w-[90%] mx-auto" />
          <div>
            <h2 className="text-3xl font-bold mb-4">Clarity at a Glance</h2>
            <p className="text-gray-600 text-lg">
              Know who needs your attention today. PeerNote’s dashboard gives you a pulse check on your entire network.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-6 bg-gray-50">
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <h2 className="text-3xl font-bold mb-4">Effortless Contact Management</h2>
            <p className="text-gray-600 text-lg">
              Add, update, or check in with your contacts without the clutter. Everything you need — and nothing you don't.
            </p>
          </div>
          <img src="/screenshots/contacts.png" alt="Contacts" className="rounded-2xl shadow-2xl border max-w-full w-[90%] mx-auto" />
        </motion.div>
      </section>

      <section className="py-20 px-6 bg-white">
        <motion.div
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <img src="/screenshots/reminders.png" alt="Reminders" className="rounded-2xl shadow-2xl border max-w-full w-[90%] mx-auto" />
          <div>
            <h2 className="text-3xl font-bold mb-4">Follow-Up Without the Friction</h2>
            <p className="text-gray-600 text-lg">
              PeerNote takes the guesswork out of remembering. Stay on top of your relationships with smart reminders that work for you.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="bg-gray-100 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="space-y-12">
            <div className="relative pl-10 text-left">
              <div className="absolute left-0 top-1.5 h-4 w-4 bg-purple-600 rounded-full"></div>
              <h3 className="text-xl font-semibold">1. Create Your Free Account</h3>
              <p className="text-gray-600">Sign up in seconds. No credit card required.</p>
            </div>
            <div className="relative pl-10 text-left">
              <div className="absolute left-0 top-1.5 h-4 w-4 bg-purple-600 rounded-full"></div>
              <h3 className="text-xl font-semibold">2. Add Contacts Instantly</h3>
              <p className="text-gray-600">Manually or via business card notes — just a few taps.</p>
            </div>
            <div className="relative pl-10 text-left">
              <div className="absolute left-0 top-1.5 h-4 w-4 bg-purple-600 rounded-full"></div>
              <h3 className="text-xl font-semibold">3. Set Smart Reminders</h3>
              <p className="text-gray-600">Choose when to follow up. We’ll remind you at the right time.</p>
            </div>
            <div className="relative pl-10 text-left">
              <div className="absolute left-0 top-1.5 h-4 w-4 bg-purple-600 rounded-full"></div>
              <h3 className="text-xl font-semibold">4. Build Meaningful Relationships</h3>
              <p className="text-gray-600">Stay top-of-mind and never let a connection go cold again.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-50 text-center py-20 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-semibold mb-2">Start your 7-day free trial</h2>
          <p className="mb-6 text-gray-600">No credit card required. Just clarity, connection, and control.</p>
          <Link
            to="/pricing"
            className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-700 shadow"
          >
            View Pricing
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500 bg-white border-t">
        <div className="space-x-6">
          <Link to="/">Home</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
        <p className="mt-4">&copy; {new Date().getFullYear()} PeerNote</p>
      </footer>
    </div>
  );
};

export default Home;
