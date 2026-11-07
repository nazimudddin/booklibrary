import { getAuth, getDb } from "@/lib/auth";
import { fetchPublicBooks } from "@/lib/public-books";

/**
 * GET /api/books
 * Public catalog read used by visitors who are not signed in.
 */
export async function GET() {
  try {
    return Response.json(await fetchPublicBooks());
  } catch (error) {
    console.error("Failed to load public books:", error);
    return Response.json({ error: "Unable to load books." }, { status: 502 });
  }
}

/**
 * POST /api/books
 * Saves a community-submitted book into the `books` collection.
 */
export async function POST(request: Request) {
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) {
      return Response.json({ error: "Please log in to add a book." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
      title,
      author,
      category,
      tags,
      imageUrl,
      description,
      ownerName,
    } = body as Record<string, unknown>;

    /* ------------------------- Server-side validation ---------------------- */
    const required: Array<[string, unknown]> = [
      ["Book title", title],
      ["Author name", author],
      ["Category", category],
      ["Book image URL", imageUrl],
      ["Book description", description],
    ];
    const missing = required.filter(([, v]) => !String(v ?? "").trim());
    if (missing.length > 0) {
      return Response.json(
        { error: `Please fill out: ${missing.map(([l]) => l).join(", ")}.` },
        { status: 400 }
      );
    }

    let safeUrl: URL;
    try {
      safeUrl = new URL(String(imageUrl));
    } catch {
      return Response.json(
        { error: "Please provide a valid image URL starting with http(s)://" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(safeUrl.protocol)) {
      return Response.json(
        { error: "Only http(s) image URLs are supported." },
        { status: 400 }
      );
    }

    /* ------------------------------- Persist ------------------------------- */
    const result = await getDb().collection("books").insertOne({
      title: String(title).trim(),
      author: String(author).trim(),
      category: String(category).trim(),
      tags: String(tags ?? "").trim(),
      imageUrl: String(imageUrl).trim(),
      description: String(description).trim(),
      ownerName: session.user.name || String(ownerName ?? "").trim() || "Anonymous",
      ownerEmail: session.user.email.toLowerCase(),
      createdAt: new Date(),
    });

    return Response.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Failed to save book:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
