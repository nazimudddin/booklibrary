import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

const backendUrl = process.env.BACKEND_URL!;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Book discovery is public. Keep these pages outside the session gate even
  // if the proxy matcher is expanded later.
  if (
    pathname === "/" ||
    pathname === "/all-books" ||
    pathname.startsWith("/all-books/") ||
    /^\/book\/[^/]+\/?$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/backend/")) {
    try {
      const headers = new Headers(request.headers);
      headers.delete("cookie");

      const backendPath = request.nextUrl.pathname.slice("/api/backend".length);
      const isPublicBookRead =
        request.method === "GET" &&
        (backendPath === "/all-books" ||
          backendPath === "/new-arrivals" ||
          /^\/book\/[^/]+$/.test(backendPath));

      // Public catalog reads must work in a logged-out browser. Keep the
      // existing token gate for every write and user-specific backend route.
      if (!isPublicBookRead) {
        const { token } = await getAuth().api.getToken({ headers: request.headers });
        if (!token) {
          return NextResponse.json({ error: "Please log in first." }, { status: 401 });
        }
        headers.set("authorization", `Bearer ${token}`);
      }

      const destination = new URL(
        `${backendPath}${request.nextUrl.search}`,
        backendUrl
      );

      return NextResponse.rewrite(destination, { request: { headers } });
    } catch {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }
  }

  const session = await getAuth().api.getSession({ headers: request.headers });

  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/all-books/:path*",
    "/book/:path*",
    "/profile/:path*",
    "/my-books/:path*",
    "/my-borrows/:path*",
    // /add-book is session-gated client-side with the same Better Auth session
    // state the Navbar uses (useSession + isPending), so a signed-in user is
    // always shown the form directly instead of being redirected to /signin by
    // a server-side check. Authentication is still enforced server-side for the
    // submission itself through the /api/backend token gate.
    "/api/backend/:path*",
  ],
};
