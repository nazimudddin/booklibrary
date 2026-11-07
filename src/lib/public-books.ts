import { MongoClient } from "mongodb";
import type { Book } from "@/lib/types";

/**
 * Public catalog reads (New Arrivals + All Books).
 *
 * PRIMARY source — the Express backend (`GET /all-books`, `/new-arrivals`),
 * unchanged: MongoDB sorts by `createdAt: -1` there and the response is
 * already stripped of owner fields.
 *
 * FALLBACK — a direct read from the very same MongoDB `books` collection
 * the Express server uses (same `booklibrary` database, same
 * MONGODB_URI that the Better Auth instance and /api/books already use).
 * It exists so the two public pages ALWAYS show the real shelves even
 * when the Express process is not running (e.g. it crashed or was never
 * restarted). No mock data anywhere — both paths read live MongoDB.
 *
 * Authentication is NOT required on either path: these are public reads
 * and every owner-identifying field is excluded, exactly matching the
 * backend's `toPublicBook`. Private features (Add Book, Borrow, Return,
 * My Books, My Borrows) stay on the JWT-protected backend routes.
 */

const BOOKS_DATABASE = "booklibrary";
const BOOKS_COLLECTION = "books";

/** Public read path — `/all-books` or `/new-arrivals`. */
type PublicCollectionPath = "/all-books" | "/new-arrivals";

/**
 * The Express backend deletes `ownerName` / `ownerEmail` / `ownerUserId`
 * before a book leaves a public API (see its `toPublicBook`). The direct
 * fallback shapes the SAME payload with a projection, so visitors can
 * never receive another user's contact data whichever path serves them.
 */
const PUBLIC_BOOK_PROJECTION = {
  ownerName: 0,
  ownerEmail: 0,
  ownerUserId: 0,
} as const;

/** Module-level singleton — mirrors the client caching in `src/lib/auth.ts`. */
let publicClient: MongoClient | undefined;
let publicClientReady: Promise<MongoClient> | undefined;

function getPublicMongoClient(): Promise<MongoClient> {
  publicClientReady ??= (async () => {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      throw new Error("MONGODB_URI is not configured for the direct catalog fallback.");
    }

    publicClient = new MongoClient(uri, {
      // Fail fast so the page can log and stream its empty state instead of
      // hanging a visitor on an unreachable Atlas connection.
      connectTimeoutMS: 5_000,
      serverSelectionTimeoutMS: 5_000,
    });
    return await publicClient.connect();
  })();

  return publicClientReady;
}

/** Flattens a raw Mongo document into the shared `Book` shape. */
function toBook(doc: WithIdShape): Book {
  return { ...(doc as unknown as Omit<Book, "_id">), _id: String(doc._id) };
}

interface WithIdShape {
  _id: unknown;
  [key: string]: unknown;
}

/**
 * Reads the `books` collection straight from MongoDB. The database does
 * the newest-first ordering (`createdAt: -1`) and, for New Arrivals, the
 * six-book limit — the browser never infers recency or trims data.
 */
async function fetchMongoBooks(path: PublicCollectionPath): Promise<Book[]> {
  const client = await getPublicMongoClient();

  let cursor = client
    .db(BOOKS_DATABASE)
    .collection(BOOKS_COLLECTION)
    .find({}, { projection: PUBLIC_BOOK_PROJECTION })
    // Same ordering as the backend's `sort({ createdAt: -1 })`.
    .sort({ createdAt: -1 });

  if (path === "/new-arrivals") {
    cursor = cursor.limit(6);
  }

  return (await cursor.toArray()).map(toBook);
}

/** Reads the collection from the Express backend (the existing behaviour). */
async function fetchBackendBookCollection(
  path: PublicCollectionPath
): Promise<Book[]> {
  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured.");
  }

  const response = await fetch(new URL(path, backendUrl), {
    cache: "no-store",
    // Bail out of a hanging (rather than refusing) backend quickly so the
    // direct-MongoDB fallback can take over without stalling the visitor.
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Public catalog request failed with ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Public catalog returned an invalid payload.");
  }

  return data as Book[];
}

/**
 * Tries the Express backend first; if that is unavailable for ANY reason
 * (process down, timeout, bad payload), falls back to reading MongoDB
 * directly. Only when BOTH sources fail is the empty-state rendered.
 */
async function fetchPublicBookCollection(
  path: PublicCollectionPath
): Promise<Book[]> {
  try {
    return await fetchBackendBookCollection(path);
  } catch (backendError) {
    console.warn(
      `Public catalog: backend unreachable for ${path} — reading MongoDB directly.`,
      backendError instanceof Error ? backendError.message : backendError
    );

    try {
      return await fetchMongoBooks(path);
    } catch (mongoError) {
      console.error("Public catalog: direct MongoDB read also failed:", mongoError);
      throw backendError;
    }
  }
}

/** Returns the complete public collection for the All Books page. */
export function fetchPublicBooks(): Promise<Book[]> {
  return fetchPublicBookCollection("/all-books");
}

/** Returns at most the six newest public books for the Home page. */
export function fetchNewArrivals(): Promise<Book[]> {
  return fetchPublicBookCollection("/new-arrivals");
}
