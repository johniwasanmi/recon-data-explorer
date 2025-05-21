
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bsnwruwxwbhnfdmuoqcf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzbndydXd4d2JobmZkbXVvcWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4MzEyMDQsImV4cCI6MjA2MzQwNzIwNH0.iFXMlz-c0lRAow3nh7xThpRCoj06Rf_9-vumsO7rizY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
