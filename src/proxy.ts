import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

const backendUrl = process.env.BACKEND_URL!;

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/backend/")) {
    try {
      const { token } = await getAuth().api.getToken({ headers: request.headers });
      if (!token) {
        return NextResponse.json({ error: "Please log in first." }, { status: 401 });
      }

      const headers = new Headers(request.headers);
      headers.delete("cookie");
      headers.set("authorization", `Bearer ${token}`);

      const backendPath = request.nextUrl.pathname.slice("/api/backend".length);
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
    "/profile/:path*",
    "/my-books/:path*",
    "/my-borrows/:path*",
    "/add-book/:path*",
    "/api/backend/:path*",
  ],
};
