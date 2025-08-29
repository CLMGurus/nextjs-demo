import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { Organization } from "@/types/syncUsers";

export async function POST(req: NextRequest) {
  const { organizationId } = await req.json();

  const cookieStore = await cookies();
  const authDataCookie = cookieStore.get("auth_orgs")?.value;

  if (!authDataCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const authData = JSON.parse(authDataCookie);
  const selectedOrg = authData.organizations?.find(
    (org: Organization) => org.id === organizationId
  );

  if (!selectedOrg) {
    return NextResponse.json(
      { error: "Invalid organization selected" },
      { status: 400 }
    );
  }

  authData.currentOrganization = selectedOrg;
  cookieStore.set("auth_orgs", JSON.stringify(authData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/", "layout");
  return NextResponse.json({ success: true });
}
