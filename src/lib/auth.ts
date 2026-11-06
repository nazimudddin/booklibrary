import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

let client: MongoClient | undefined;
let authInstance: ReturnType<typeof createAuthInstance> | undefined;

function getAuthBaseURL() {
  const configuredURL = process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL === "1") {
    const vercelHost =
      process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_URL;
    const configuredIsLocalhost =
      configuredURL && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredURL);
    const baseURL = configuredIsLocalhost
      ? undefined
      : configuredURL || (vercelHost ? `https://${vercelHost}` : undefined);
    return baseURL?.replace(/^http:\/\//i, "https://");
  }
  return configuredURL;
}

function getMongoClient() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is required to use authentication.");
    client = new MongoClient(uri);
  }
  return client;
}

export function getDb() {
  return getMongoClient().db("booklibrary");
}

function createAuthInstance() {
  const client = getMongoClient();
  const db = client.db("booklibrary");
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appleClientId = process.env.APPLE_CLIENT_ID;
  const appleClientSecret = process.env.APPLE_CLIENT_SECRET;
  const baseURL = getAuthBaseURL();

  return betterAuth({
    baseURL,
    database: mongodbAdapter(db, {
      client,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      ...(googleClientId && googleClientSecret
        ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
        : {}),
      ...(appleClientId && appleClientSecret
        ? { apple: { clientId: appleClientId, clientSecret: appleClientSecret } }
        : {}),
    },
    plugins: [
      // JWT plugin — signs short-lived access tokens for the Express backend.
      // The private keys live in the SAME "jwks" collection (mongo adapter)
      // encrypted with BETTER_AUTH_SECRET, and only the public half is served
      // at /api/auth/jwks. Login / registration / sessions are unchanged.
      jwt({
        jwt: {
          // Both values are checked again by the Express backend when it
          // verifies each Bearer token.
          issuer: baseURL!,
          audience: process.env.BACKEND_URL!,
          // One hour per token — /api/auth/token mints a fresh one quietly
          // while the user is signed in.
          expirationTime: "1h",
        },
      }),
    ],
  });
}

export function getAuth(): NonNullable<typeof authInstance> {
  if (!authInstance) authInstance = createAuthInstance();
  return authInstance;
}
