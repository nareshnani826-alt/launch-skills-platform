import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const value = process.env.SUPABASE_URL;
  if (!value) throw new Error("SUPABASE_URL is not set");
  return value;
}

export function authEmailForUsername(username: string): string {
  if (username.includes("@")) return username;
  const domain = process.env.AUTH_EMAIL_DOMAIN ?? "launchskills.local";
  return `${username}@${domain}`;
}

export function createSupabaseAuthClient() {
  const key = process.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error("SUPABASE_ANON_KEY is not set");
  return createClient(getSupabaseUrl(), key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(getSupabaseUrl(), key, { auth: { autoRefreshToken: false, persistSession: false } });
}