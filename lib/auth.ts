import { cookies } from "next/headers";
import { getUserWithToken } from "@/utils/supabase/getUserWithToken";
import { redirect } from "next/navigation";

export interface AuthData {
  user: { id: string; fullName: string; email: string; role: string } | null;
  organizationId: string | null;
  accessToken: string | null;
}

export async function getAuthData(
  redirectOnFailure: boolean = true
): Promise<AuthData> {
  const cookieStore = await cookies();
  const authUserCookie = cookieStore.get("auth_user")?.value;
  const authOrgsCookie = cookieStore.get("auth_orgs")?.value;

  let user: AuthData["user"] = null;
  let organizationId: string | null = null;
  let accessToken: string | null = null;

  // Parse auth_user cookie
  if (authUserCookie) {
    try {
      const authUser = JSON.parse(authUserCookie);
      user = authUser.user || null;
    } catch (error) {
      console.error("Failed to parse auth_user cookie:", error);
    }
  }

  // Parse auth_orgs cookie
  if (authOrgsCookie) {
    try {
      const authOrgs = JSON.parse(authOrgsCookie);
      organizationId = authOrgs.currentOrganization?.id || null;
    } catch (error) {
      console.error("Failed to parse auth_orgs cookie:", error);
    }
  }

  // Verify Supabase session
  const supabaseUser = await getUserWithToken();
  accessToken = supabaseUser?.accessToken || null;

  // Redirect if authentication or organization is missing
  if (redirectOnFailure && (!user || !organizationId || !accessToken)) {
    const errorMessage = !accessToken
      ? "Session expired"
      : "Please log in to continue";
    redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
  }

  return { user, organizationId, accessToken };
}
