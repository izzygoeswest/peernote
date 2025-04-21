import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txacnqaxzcjegrthrqzj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4YWNucWF4emNqZWdydGhycXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMjQ3OTAsImV4cCI6MjA2MDYwMDc5MH0.aZ-IR5i_n5KTjIzOzQbxbjaBpSpBOO3UgDa2E9uks20';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      Accept: 'application/json',
    },
  },
});
