// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nqspuwzqrwamccpqwwvj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc3B1d3pxcndhbWNjcHF3d3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTM3NjYsImV4cCI6MjA2NDY4OTc2Nn0.ZaqMK8i4IXrfsYD6f_PBksaiq1Q1GtxRTukohrRLfJU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);