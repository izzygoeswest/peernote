// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Pull in exactly these two env-vars
let SUPA_URL = import.meta.env.VITE_SUPABASE_URL
let SUPA_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPA_URL) {
  throw new Error('Missing VITE_SUPABASE_URL')
}
if (!SUPA_URL.startsWith('http')) {
  SUPA_URL = 'https://' + SUPA_URL.replace(/^(https?:\/\/)?/, '')
}

if (!SUPA_ANON) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPA_URL, SUPA_ANON)
