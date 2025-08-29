// app/actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { fetchWithToken } from "@/lib/fetchApi/server";
import { SyncUserRequest, SyncUserResponse } from "@/types/syncUsers";

export async function login(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const loginData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signInWithPassword(loginData);

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { user } = data;

  // Fetch user profile from Supabase
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    redirect(`/login?error=${encodeURIComponent(profileError.message)}`);
  }

  // Prepare user data for sync
  const userData = {
    id: user.id,
    fullName: profile.full_name,
    email: user.email || "",
    role: profile.role,
  };

  // Sync with backend
  try {
    const syncData = await fetchWithToken<SyncUserResponse, SyncUserRequest>(
      "/api/v1/sync-user",
      {
        method: "POST",
        body: {
          user_id: userData.id,
          name: userData.fullName,
          email: userData.email,
          role: userData.role,
        },
      }
    );

    // Store user data in cookies for persistence
    const cookieStore = await cookies();
    cookieStore.set(
      "auth_user",
      JSON.stringify({
        user: {
          id: syncData.user.user_id,
          fullName: syncData.user.name,
          email: syncData.user.email,
          role: syncData.user.role,
        },
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );
    cookieStore.set(
      "auth_orgs",
      JSON.stringify({
        currentOrganization: syncData.user.personal_organization,
        personalOrganization: syncData.user.personal_organization,
        organizations: syncData.user.organizations,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );
  } catch (syncError) {
    console.error("Backend sync failed:", syncError);
    redirect(`/login?error=${encodeURIComponent("Failed to sync user data")}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
