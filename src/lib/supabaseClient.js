// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqnfogerbejimwwuszmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxbmZvZ2VyYmVqaW13d3Vzem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTY0MDksImV4cCI6MjA2NDkzMjQwOX0.7lMOqP3lbPYLimAaWxonDBdRrCNNk_rPzokQWcX_Yzc';

export const supabase = createClient(supabaseUrl, supabaseKey);
