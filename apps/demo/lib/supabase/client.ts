import { createClient } from "@supabase/supabase-js";

// Note: These environment variables are configured in `.env.local`
// and are defined in the `.env.local.template` file.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error(
    "Supabase environment variables are not set. Please check your .env.local file.",
  );
}

/**
 * A Supabase client for use on the client-side (in browser).
 * It uses the anonymous key and is safe to expose to the public,
 * as long as you have Row-Level Security (RLS) enabled on your tables.
 */
export const supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * A Supabase client for use on the server-side (in API routes, server components).
 * It uses the service role key, which bypasses all RLS policies.
 *
 * WARNING: This client should NEVER be exposed to the client-side.
 * Always use it within server-side logic (e.g., API routes).
 */
export const supabaseServerClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
);
