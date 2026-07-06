# Cris Charles Garcia - Personal Portfolio

A premium, modern, and high-performance personal portfolio built as specified in `AGENT.md` using the Astro + React framework, styled with Tailwind CSS, and optimized for Sanity CMS integration.

## Features

- 🌟 **Premium Glassmorphic Design:** Visual aesthetics inspired by Android 17 / Material You, featuring high-performance frosted glass, glowing radial highlights, and fluid transitions.
- 📱 **Responsive & Mobile-First:** Fluid design that scales beautifully from ultrawide screens down to mobile phones.
- 🧭 **OS-like Navigation:** Floating pill navigation bar that shifts on scroll, automatically highlights current sections using scroll spy (`IntersectionObserver`), and opens a glass drawer menu on mobile.
- 🌓 **Dynamic Theme Engine:** Class-based Light and Dark mode switching with system preference detection and FOUC prevention.
- 🤖 **AI Twin Chatbot:** Dedicated assistant page powered by Gemini API, loaded with full portfolio details to answer user inquiries dynamically.
- 📨 **Validated Contact Form:** Seamless contact input form with complete client/server verification and Resend email dispatcher.
- 🔗 **NFC Social Links Directory:** Mobile-first, large tap target listing (`/links`) optimized for instant tag redirects.

## Tech Stack

- **Core Framework:** [Astro v7](https://astro.build/)
- **UI Components:** [React v19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Hosting:** [Vercel](https://vercel.com/)
- **AI Integration:** [Gemini API](https://ai.google.dev/)
- **Email Dispatcher:** [Resend REST API](https://resend.com/)

---

## Directory Structure

```
/
├── src/
│   ├── assets/        # Media and static graphic assets
│   ├── components/    # Reusable React UI blocks (Hero, Navbar, etc.)
│   ├── layouts/       # Base Layout templates with SEO and Theme scripts
│   ├── lib/           # Data services and CMS content resolvers
│   ├── pages/         # Routing pages (index, projects, links, chat, contact)
│   │   └── api/       # Serverless API routes (chat, contact form submission)
│   └── styles/        # Global style sheets (Tailwind and Custom variables)
├── public/            # Static public assets (icons, manifest)
├── astro.config.mjs   # Astro config (Vercel SSR and integrations)
├── tailwind.config.ts # Tailwind CSS theme variables
├── tsconfig.json      # TypeScript specifications
├── package.json       # App scripts and dependencies
└── AGENT.md           # Developer agent specifications and guidelines
```

---

## Environment Variables

To run the application with full external service functionality, add the following to a `.env` or `.env.local` file:

```env
# CMS integration details (optional, falls back to Mock data if empty)
SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_API_VERSION=
SANITY_READ_TOKEN=

# Transactional email settings
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_email@example.com

# AI Chat assistant configuration
GEMINI_API_KEY=your_gemini_api_key
```

*Note: The website is fully designed to fallback on static mock values if CMS or API variables are absent.*

---

## Local Development Setup

To boot up the portfolio local server, run the following commands:

```bash
# Install dependencies
npm install

# Force-install WASM compiler bindings (Necessary if running on Android/Termux)
npm install @astrojs/compiler-binding-wasm32-wasi --force

# Launch the Astro local server
npm run dev
```

The application will be served at `http://localhost:4321`.

---

## Production Build

To test production bundling or prepare assets for deployment:

```bash
npm run build
```
