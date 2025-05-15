// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Grab from your Vite env
let url = import.meta.env.VITE_SUPABASE_URL
if (!url.startsWith('http')) {
  url = 'https://' + url.replace(/^(https?:\/\/)?/, '')
}

const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment!'
  )
}

export const supabase = createClient(url, key)
