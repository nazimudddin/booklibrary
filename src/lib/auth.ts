import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("booklibrary");
export { db };

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
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
