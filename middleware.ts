import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Allow static assets & Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return response;
  }

  // Allow login page
  if (pathname === "/login") {
    if (user) {
      const orgsCookie = request.cookies.get("auth_orgs")?.value;
      let hasValidOrg = false;
      if (orgsCookie) {
        try {
          const orgsData = JSON.parse(orgsCookie);
          hasValidOrg = !!orgsData.currentOrganization?.id;
        } catch (error) {
          console.error("Middleware: Failed to parse auth_orgs:", error);
        }
      }
      if (hasValidOrg) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return response;
  }

  // Protect all other routes
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Enforce organization check
  const orgsCookie = request.cookies.get("auth_orgs")?.value;
  if (!orgsCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    const orgsData = JSON.parse(orgsCookie);
    if (!orgsData.currentOrganization?.id) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error("Middleware: Failed to parse auth_orgs:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
