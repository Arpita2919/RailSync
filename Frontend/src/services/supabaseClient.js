import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[RailSync Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables are missing in Frontend/.env'
  );
}

// Fallback to dummy client if not configured so app doesn't crash on import
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabasePublishableKey || 'placeholder-anon-key'
);

export default supabase;
