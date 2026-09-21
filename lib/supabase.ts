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

// Sets the password for the Supabase Auth user behind `username`, creating the
// auth user first if none exists (accounts that predate the Supabase migration).
// Returns the auth user id, or an error message.
export async function upsertSupabaseAuthPassword(
  username: string,
  password: string,
  existingAuthUserId?: string | null
): Promise<{ authUserId: string } | { error: string }> {
  const admin = createSupabaseAdminClient();

  let authUserId = existingAuthUserId ?? null;
  if (!authUserId) {
    const email = authEmailForUsername(username).toLowerCase();
    const perPage = 1000;
    for (let page = 1; !authUserId; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return { error: error.message };
      authUserId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
      if (data.users.length < perPage) break;
    }
  }

  if (authUserId) {
    const { error } = await admin.auth.admin.updateUserById(authUserId, { password });
    return error ? { error: error.message } : { authUserId };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: authEmailForUsername(username),
    password,
    email_confirm: true,
  });
  if (error || !data.user) return { error: error?.message ?? "Failed to create Supabase Auth user" };
  return { authUserId: data.user.id };
}