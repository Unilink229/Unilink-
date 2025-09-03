import { createClient } from "@supabase/supabase-js";

// Supabase admin client using service role key. This file is imported by other API routes.
// DO NOT expose your SERVICE ROLE key to the browser; this only runs on the server.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false } }
);