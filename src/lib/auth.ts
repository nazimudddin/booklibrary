import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

let client: MongoClient | undefined;
let authInstance: ReturnType<typeof createAuthInstance> | undefined;

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

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
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
          issuer: process.env.BETTER_AUTH_URL!,
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
