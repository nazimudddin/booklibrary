# 📚 BookLibrary

A community book library where readers discover, share and borrow their
favourite stories — from timeless classics to the newest arrivals on the shelf.

> ## 🌐 Live Site
> **[https://booklibrary.vercel.app](https://booklibrary.vercel.app)**
>
> <!-- TODO: replace the URL above with your deployed client URL
>      (e.g. your-project.vercel.app or your custom domain). -->

## ✨ Features

- **Discover the collection** — browse the full catalog on *All Books* or jump
  straight to the *New Arrivals* shelf, with dedicated detail pages for every
  book (cover image, description, category, tags and live copy availability).
- **Share your own books** — a guided *Add Book* form (title, author, category,
  tags, cover image, description and total copies) that auto-fills owner name
  and email from your profile, and shows a friendly login prompt when you're
  signed out.
- **Manage your personal shelf** — *My Books* lists everything you contributed
  so you can edit any detail or delete a book you added, with the UI staying in
  sync with the live copy counts.
- **Borrow and keep track** — request a book while copies are available and
  follow every checkout on your *My Borrows* dashboard in one place.
- **Real accounts, real sessions** — email & password sign-up/login plus
  one-click Google sign-in, powered by Better Auth with JWT-secured calls to
  the backend; the navbar instantly reflects your logged-in state everywhere.
- **Built to be used on any screen** — a responsive, frosted-glass amber &
  slate UI (Tailwind CSS v4) with sticky glass navbar, dropdown user menu and
  mobile sheet navigation.

## 🧰 Tech Stack

| Layer            | Technology                                                |
| ---------------- | --------------------------------------------------------- |
| Frontend         | Next.js 16 (App Router, React 19, Turbopack)              |
| Styling          | Tailwind CSS v4, shadcn/ui, lucide-react icons            |
| Auth             | Better Auth (email/password + Google OAuth, JWT plugin)   |
| Database         | MongoDB (Atlas) via the Better Auth Mongo adapter         |
| Backend API      | Express server (`../booklibraryServer`), proxied through Next.js (`src/proxy.ts`) |
| Deployment       | Vercel                                                    |

## 🚀 Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

Environment variables live in `.env` (see `BETTER_AUTH_*`, `BACKEND_URL`,
`MONGODB_URI`). The Express backend from `../booklibraryServer` should be
reachable at the configured `BACKEND_URL` for book operations.

## 📁 Notable Files

- `src/app` — route pages (home, all-books, book details, add-book, my-books,
  my-borrows, profile, signin/signup).
- `src/proxy.ts` — server-side session gating for private routes and the
  JWT-minting proxy to the backend (`/api/backend/*`).
- `src/lib/auth.ts` / `src/lib/auth-client.ts` — Better Auth server and client
  configuration.
