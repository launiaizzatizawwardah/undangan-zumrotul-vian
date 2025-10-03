import { createClient } from "@supabase/supabase-js";

// URL dari Supabase project kamu
const supabaseUrl = "https://cndvtejoqssrugvrcgnl.supabase.co"; // ✅ pastikan sama persis

// Public anon key (punya kamu)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZHZ0ZWpvcXNzcnVndnJjZ25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NTc0NjMsImV4cCI6MjA3NTAzMzQ2M30.XWea1ONCqBycAajrUF3dJowzQISN_3FcnjlzeJr2J-E";

export const supabase = createClient(supabaseUrl, supabaseKey);
