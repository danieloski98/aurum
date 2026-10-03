# Next.js + React Hook Form + Supabase Starter

A modern Next.js App Router application built with **TypeScript**, **React Hook Form**, and the official **Supabase SDK** (`@supabase/ssr` & `@supabase/supabase-js`).

## Features

- **Next.js App Router**: Optimized layout and routing with React 19 / Next.js 16.
- **Form Management with React Hook Form**:
  - Type-safe forms with `useForm<T>`
  - Real-time field validation & custom error messages
  - Async submit handling & loading states
- **Supabase Integration**:
  - Browser Client (`src/lib/supabase/client.ts`) for client components
  - Server Client (`src/lib/supabase/server.ts`) with cookie handling for Server Components & Server Actions
  - `.env.local` configuration setup
- **Modern UI & Glassmorphism Design**: Custom dark-mode styling with subtle gradients, responsive grids, and icons from `lucide-react`.

---

## Getting Started

### 1. Install Dependencies (already installed)
```bash
npm install
```

### 2. Configure Supabase Environment Variables
Copy `.env.example` to `.env.local` and add your project details from the [Supabase Dashboard](https://supabase.com/dashboard):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
teaching/
├── src/
│   ├── app/
│   │   ├── globals.css         # Custom styling, dark mode & glassmorphism theme
│   │   ├── layout.tsx          # Root Next.js layout
│   │   └── page.tsx            # Main showcase dashboard
│   ├── components/
│   │   ├── SupabaseStatus.tsx        # Connection status & setup guide
│   │   ├── UserRegistrationForm.tsx  # Auth & signup form (react-hook-form)
│   │   └── TeachingNotesForm.tsx     # Data insertion form (react-hook-form + Supabase)
│   └── lib/
│       └── supabase/
│           ├── client.ts       # Supabase browser client builder
│           └── server.ts       # Supabase server client builder
├── .env.example
├── .env.local
└── package.json
```

---

## Forms Included

1. **User Registration Form** ([`src/components/UserRegistrationForm.tsx`](file:///Users/angel/Documents/Projects/teaching/src/components/UserRegistrationForm.tsx))
   - Name, Email, Password validation with regex pattern matching.
   - Role dropdown and Terms of Service checkbox required field validation.
   - Calls `supabase.auth.signUp()`.

2. **Teaching Notes Form** ([`src/components/TeachingNotesForm.tsx`](file:///Users/angel/Documents/Projects/teaching/src/components/TeachingNotesForm.tsx))
   - Title, Category, Priority, Content textarea, and Public visibility toggle.
   - Insert records into Supabase table via `supabase.from('notes').insert(...)`.
