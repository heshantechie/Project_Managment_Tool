import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qlnqwgcbksmjtrtljbgk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbnF3Z2Nia3NtanRydGxqYmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTMzMjksImV4cCI6MjA5MTI4OTMyOX0.Sz-hR26GARS3Doif7sOzRY_HcqtbVRQdTD8aaTdSYNM';

export const supabase = createClient(supabaseUrl, supabaseKey);
