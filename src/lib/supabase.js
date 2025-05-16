import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lztxixcgxwrodqhecwfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhpeGNneHdyb2RxaGVjd2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTg2MTUsImV4cCI6MjA2Mjk3NDYxNX0.9JeGP9dhdWmSs0zKHieY84lPQhhkg9V0yVVeJ-eq_OE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase; 