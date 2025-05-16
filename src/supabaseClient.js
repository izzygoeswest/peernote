// src/supabaseClient.js

// Log env vars at startup to verify they’re being injected correctly
console.log('🍾 VITE_SUPABASE_URL =', import.meta.env.VITE_SUPABASE_URL)
console.log('🔑 VITE_SUPABASE_ANON_KEY =', import.meta.env.VITE_SUPABASE_ANON_KEY)

import { createClient } from '@supabase/supabase-js'

// Pull in the URL and key from Vite’s env
let SUPA_URL = import.meta.env.VITE_SUPABASE_URL
let SUPA_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

// Basic sanity checks
if (!SUPA_URL) {
  throw new Error('Missing VITE_SUPABASE_URL in environment')
}
// Ensure the URL starts with https://
if (!SUPA_URL.startsWith('http')) {
  SUPA_URL = 'https://' + SUPA_URL.replace(/^(https?:\/\/)?/, '')
}

if (!SUPA_ANON) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY in environment')
}

// Create and export the Supabase client
export const supabase = createClient(SUPA_URL, SUPA_ANON)
