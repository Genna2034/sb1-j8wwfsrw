import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovqthbcvzpruyyfwegwc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cXRoYmN2enBydXl5ZndlZ3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MzYyNTcsImV4cCI6MjA2NTExMjI1N30.wwMuU_g6xuz7cTDcHBdIUhpgDOHQ1FWN_6j0qi5rUEs';

export const supabase = createClient(supabaseUrl, supabaseKey);