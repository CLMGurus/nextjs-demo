import { createClient } from "@/utils/supabase/server";

export async function getUserWithToken() {
  const supabase = await createClient();

  // ✅ Get the user session (includes access_token)
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) return null;

  const accessToken = session.access_token;

  // ✅ Authenticates the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    ...user,
    full_name: profile?.full_name ?? null,
    role: profile?.role ?? null,
    accessToken, // ✅ now you can send this to FastAPI
  };
}
