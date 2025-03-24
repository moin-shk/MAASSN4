import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cerhjsjehunidnbhdrmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlcmhqc2plaHVuaWRuYmhkcm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDE4MzQsImV4cCI6MjA1ODQxNzgzNH0.w5azMp2Sa0v90wsug55_R3qH-OdWxVwTZVMiOql52FM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
