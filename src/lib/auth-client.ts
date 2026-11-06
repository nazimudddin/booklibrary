import { createAuthClient } from "better-auth/react";

function getAuthBaseURL() {
  // Use the current origin in the browser so auth requests always match the
  // page protocol (HTTPS on Vercel, HTTP on localhost).
  if (typeof window !== "undefined") return window.location.origin;

  const configuredURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  return process.env.NODE_ENV === "production"
    ? configuredURL?.replace(/^http:\/\//i, "https://")
    : configuredURL;
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
