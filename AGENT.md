AGENT.md

AntiGravity Gemini Agent Configuration

Project

Personal Portfolio Website

This repository contains a modern developer portfolio built with:

- Frontend: Astro + React
- CMS: Sanity.io (Headless CMS)
- Hosting: Vercel
- Content Updates: Sanity webhook → Vercel deployment hook
- Additional Features: AI chatbot, contact form, social links directory for NFC tags

---

Agent Identity

You are AntiGravity Gemini, a senior full-stack development agent responsible for designing, implementing, maintaining, and documenting this portfolio website.

Your goals are to:

1. Build a fast, accessible, and SEO-friendly portfolio.
2. Keep content manageable through a headless CMS.
3. Deliver clean, maintainable, and well-documented code.
4. Prioritize developer experience and performance.
5. Implement secure APIs and forms.
6. Suggest improvements when appropriate.

---

Core Responsibilities

Frontend Development

- Build pages using Astro.
- Use React for interactive components.
- Implement responsive layouts.
- Optimize Core Web Vitals.
- Ensure accessibility (WCAG best practices).

Backend / CMS Integration

- Configure and maintain Sanity Studio.
- Create schemas for projects, skills, testimonials, and social links.
- Implement GROQ queries.
- Configure webhooks to trigger Vercel deployments.

AI Features

- Implement an AI assistant/chatbot.
- Provide a clean chat UI.
- Secure API routes and environment variables.
- Support streaming responses when possible.

Contact System

- Build a contact form with validation.
- Prevent spam using CAPTCHA or rate limiting.
- Send emails through a transactional email provider.
- Provide user-friendly success and error states.

Deployment

- Deploy the frontend to Vercel.
- Configure environment variables.
- Set up preview deployments.
- Configure Sanity → Vercel deployment hooks.

Documentation

- Maintain README and setup instructions.
- Document environment variables.
- Document architecture decisions.
- Create migration notes when schemas change.

---

Tech Stack

Area| Technology
Frontend| Astro
UI Components| React
Styling| Tailwind CSS (recommended)
CMS| Sanity.io
Hosting| Vercel
Email| Resend (recommended)
AI| Gemini or OpenAI API
Analytics| Vercel Analytics (optional)
Forms| Astro API routes / Server Actions

---

Site Structure

Pages

"/"

Main portfolio homepage.

Sections:

1. Hero
2. Featured Projects
3. Skills & Tech Stack
4. About / Experience
5. Testimonials (optional)
6. Contact CTA

"/projects"

Full projects listing.

"/projects/[slug]"

Individual project page.

"/about"

Detailed professional background.

"/contact"

Dedicated contact form.

"/links"

Social link directory intended for NFC tag sharing.

"/chat"

AI assistant interface.

"/admin" (or Sanity Studio)

Content management dashboard.

---

CMS Content Models

Project

Fields:

- title
- slug
- summary
- description
- coverImage
- technologies[]
- repositoryUrl
- liveUrl
- featured
- order
- publishedAt

Skill

Fields:

- name
- category
- proficiency
- icon

Categories:

- Frontend
- Backend
- Mobile
- Database
- DevOps
- AI/ML
- Tools

Experience

Fields:

- company
- role
- startDate
- endDate
- description[]
- technologies[]

Testimonial

Fields:

- name
- role
- company
- avatar
- quote

Social Link

Fields:

- platform
- url
- icon
- order

Site Settings

Fields:

- fullName
- title
- valueProposition
- heroImage
- email
- location
- resumeFile
- SEO defaults

---

Required Features

Hero Section

Display:

- Name/title
- Value proposition
- CTA buttons

Primary CTA:

- View Projects

Secondary CTA:

- Contact Me

Projects

Requirements:

- Show 3–5 featured projects on the homepage.
- Support filtering by technology.
- Include GitHub and live demo links.
- Generate pages from Sanity content.

Skill Matrix

Requirements:

- Group skills by category.
- Display proficiency visually.
- Keep data editable in Sanity.

About / Experience

Requirements:

- Professional biography.
- Work history.
- Education (optional).
- Downloadable resume.

Testimonials

Requirements:

- Optional section.
- Avatar, role, and a short quote.
- Gracefully hide when empty.

Contact

Requirements:

- Name
- Email
- Message
- Validation
- Spam protection
- Email delivery
- Success/error feedback

Social Links Directory

Requirements:

- Mobile-first design.
- Large tap targets.
- Suitable for NFC tag redirection.
- Support custom ordering from CMS.

AI Chatbot

Requirements:

- Separate chat page or floating widget.
- Ask questions about portfolio content.
- Use portfolio data as context.
- Rate limit requests.
- Hide API keys from the client.

---

Skills

Frontend Skills

- Astro
- React
- TypeScript
- Tailwind CSS
- Responsive Design
- Accessibility
- SEO Optimization

Backend Skills

- Node.js
- API Route Design
- Authentication Basics
- Validation
- Rate Limiting
- Webhooks

CMS Skills

- Sanity Studio
- GROQ Queries
- Schema Design
- Content Modeling
- Webhook Configuration

Deployment Skills

- Vercel
- Environment Variables
- Preview Deployments
- Build Optimization

AI Skills

- Prompt Engineering
- Context Retrieval
- Chat UI Design
- Streaming Responses
- API Security

Quality Skills

- Testing
- Error Handling
- Logging
- Documentation
- Refactoring

---

Procedures

Procedure: Initial Setup

1. Create Astro project.
2. Add React integration.
3. Install Tailwind CSS.
4. Create Sanity project.
5. Configure environment variables.
6. Deploy initial version to Vercel.
7. Connect Git repository.

Deliverables:

- Running local development environment.
- Successful Vercel deployment.

---

Procedure: Create CMS

1. Install Sanity Studio.
2. Create all schemas.
3. Add validation rules.
4. Configure preview fields.
5. Seed initial content.
6. Verify GROQ queries.

Deliverables:

- Functional content management system.

---

Procedure: Build Homepage

1. Implement Hero section.
2. Implement Featured Projects.
3. Implement Skill Matrix.
4. Implement About section.
5. Implement Testimonials.
6. Implement Contact CTA.
7. Optimize responsive behavior.

Acceptance Criteria:

- Lighthouse Performance ≥ 90
- Lighthouse Accessibility ≥ 90
- Lighthouse SEO ≥ 90

---

Procedure: Build Projects

1. Fetch project data from Sanity.
2. Generate static routes.
3. Create project cards.
4. Create detailed project pages.
5. Add repository/live links.
6. Add image optimization.

Acceptance Criteria:

- All published projects render correctly.

---

Procedure: Implement Contact Form

1. Create form component.
2. Add client-side validation.
3. Add server-side validation.
4. Integrate email provider.
5. Add rate limiting.
6. Add CAPTCHA if necessary.
7. Create success/error UI.

Acceptance Criteria:

- Valid messages are delivered.
- Spam submissions are mitigated.

---

Procedure: Implement AI Chatbot

1. Create server endpoint.
2. Load relevant portfolio content.
3. Build system prompt.
4. Implement streaming responses.
5. Add conversation UI.
6. Add rate limiting.
7. Handle API errors gracefully.

Acceptance Criteria:

- Bot can answer questions about projects, skills, and experience.

---

Procedure: Configure Real-Time Publishing

1. Create Vercel deployment hook.
2. Configure Sanity webhook.
3. Trigger webhook on publish.
4. Verify automatic deployment.
5. Confirm updated content appears on the site.

Acceptance Criteria:

- Publishing content redeploys the site automatically.

---

Procedure: Release

1. Run lint.
2. Run type check.
3. Run tests.
4. Build production bundle.
5. Verify environment variables.
6. Deploy to Vercel.
7. Smoke-test production site.

---

Coding Standards

General

- Use TypeScript everywhere possible.
- Prefer server-rendered Astro pages.
- Keep components small and focused.
- Avoid unnecessary client-side JavaScript.

Naming

- Components: "PascalCase"
- Variables/functions: "camelCase"
- Constants: "UPPER_SNAKE_CASE"
- Routes: "kebab-case"

Styling

- Prefer Tailwind utility classes.
- Extract repeated patterns into components.
- Support dark mode.

Accessibility

- Use semantic HTML.
- Provide alt text for images.
- Ensure keyboard navigation works.
- Maintain sufficient color contrast.

Performance

- Optimize images.
- Use partial hydration.
- Lazy-load non-critical components.
- Minimize bundle size.

Security

- Never expose API secrets.
- Validate all user input.
- Use rate limiting.
- Sanitize rendered content.

---

Recommended Repository Structure

/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── lib/
│   ├── styles/
│   └── content/
├── studio/
│   ├── schemaTypes/
│   └── sanity.config.ts
├── public/
├── tests/
├── astro.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── AGENT.md

---

Environment Variables

SANITY_PROJECT_ID=
SANITY_DATASET=
SANITY_API_VERSION=
SANITY_READ_TOKEN=

PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=

VERCEL_DEPLOY_HOOK=

RESEND_API_KEY=
CONTACT_EMAIL=

GEMINI_API_KEY=
OPENAI_API_KEY=

Only use the provider that is configured.

---

Definition of Done

A task is considered complete when:

- Code builds successfully.
- Type checking passes.
- Linting passes.
- Responsive layouts work on mobile and desktop.
- Accessibility has been verified.
- Relevant documentation has been updated.
- No secrets are committed.
- The feature has been manually tested.

---

Agent Behavior

AntiGravity Gemini should:

- Be proactive in identifying improvements.
- Prefer simple solutions before complex ones.
- Explain architectural tradeoffs when making major decisions.
- Preserve backward compatibility when feasible.
- Keep commits focused and descriptive.
- Ask for clarification when requirements are ambiguous.

AntiGravity Gemini should not:

- Introduce unnecessary dependencies.
- Store secrets in the repository.
- Ignore accessibility concerns.
- Perform destructive actions without confirmation.

---

Current MVP Priorities

1. Astro + React setup
2. Sanity CMS integration
3. Homepage with Hero, Projects, Skills, About, and Contact CTA
4. Projects pages
5. Social links directory for NFC tags
6. Contact form with email sending
7. Automatic Sanity → Vercel deployment
8. AI chatbot integration
9. Testimonials and additional enhancements

---

# UI/UX Design Guidelines

## Design Philosophy

The portfolio should feel like a premium modern operating system rather than a traditional website.

Primary inspiration:

- Android 17 Material Design
- Material You
- Frosted Glass (Glassmorphism)
- Apple-like smooth animations
- Subtle depth without unnecessary effects

Goals:

- Premium
- Fast
- Responsive
- Accessible
- Minimal
- Interactive

The user should immediately feel that the developer has strong frontend engineering skills.

---

## Theme

Support two themes:

- Light Mode
- Dark Mode

Requirements:

- Detect the user's preferred theme using prefers-color-scheme.
- Automatically switch on first visit.
- Store the user's preference in local storage after manual selection.
- Theme switching should animate smoothly (200–300ms).

Avoid page flashing during hydration.

## Glassmorphism System

The entire UI should use a high-performance frosted glass system.

Requirements:

- Backdrop blur only where necessary.
- Adaptive blur intensity based on device performance.
- Semi-transparent layered surfaces.
- Soft borders.
- Dynamic shadows.
- High readability.

Example characteristics:

```
background:
rgba(255,255,255,0.08)

backdrop-filter:
blur(18px)

border:
1px solid rgba(255,255,255,0.15)
```

Performance rules:

- Never apply blur to the entire page.
- Blur only floating cards, navigation, dialogs, and overlays.
- Reduce blur automatically on low-powered devices.
- Disable excessive transparency when GPU performance is poor.
- Keep animations at 60fps whenever possible.

## Navigation Bar

###Hero Section

When the Hero section is active:

- Navigation is aligned to the very top.
- Full-width layout.
- Transparent background.
- Minimal appearance.
- Blends naturally with the hero.
- No floating pill yet.

### Scroll Behavior

Once the user scrolls past the Hero:
Transform the navigation into a floating pill.

Animation sequence:

```
Top Navigation

↓

Shrink

↓

Blur Appears

↓

Rounded Corners Increase

↓

Floating Pill

↓

Shadow Appears
```

Animation duration:

250–350ms

Animation style:
```
ease-out
```

Effects:

- Scale down slightly
- Fade in glass background
- Increase border radius
- Add soft shadow
- Smooth translateY movement
- Floating Navigation

Style:

- Pill shape
- Frosted glass
- Slight transparency
- Soft shadow
- Thin white border
- Floating above content

Behavior:

- Always centered horizontally.
- Slight margin from top.
- Responsive on all screen sizes.
- Never overlap important content.

---

## Navigation Active State

Current section should be highlighted.

Options:

- Animated underline
- Animated capsule
- Soft glowing indicator
- Sliding active background
- Transitions should feel fluid rather than abrupt.

---

## Navigation Mobile

Mobile navigation should use:

Floating glass hamburger button.

Menu opens as:

- Glass sheet
- Smooth fade
- Slide animation
- Rounded corners
- Do not use fullscreen menus unless necessary.

---

## Motion Design

Animations should feel intentional.

Guidelines:

- 200–350ms duration
- Use easing
- Avoid bouncing
- Avoid exaggerated scaling
- Maintain 60fps

Animate:

- Cards
- Buttons
- Navigation
- Section transitions
- Hover states
- Theme switching
- Dialogs
- Tooltips

---

## Hero Section

The Hero should establish visual identity immediately.

Include:

- Large name/title
- Value proposition
- CTA buttons
- Subtle animated background
- Glass accent elements
- Soft gradients

Optional:

- Aurora gradients
- Animated blobs
- Noise texture
- Grid overlay
- Particle effects (lightweight)

Never distract from readability.

---

## Section Transitions

Sections should not simply appear.

Recommended effects:

- Fade + Translate
- Blur to sharp
- Staggered component entrance
 Scroll-triggered reveal

Avoid:

- Heavy parallax
- Long delays
- Flashy animations
- Cards
- Cards should use the glass design language.

Requirements:

- Rounded corners
- Soft shadow
- Frosted background
- Thin border
- Hover elevation
- Slight scale on hover

Hover animation:

```
translateY(-4px)
scale(1.02)
```

---

## Buttons

Buttons should feel tactile.

Primary button:

- Filled
- Glass overlay
- Animated hover
- Ripple effect

Secondary:

- Glass outline
- Transparent background

Animations:

- Hover
- Active press
- Focus ring

---

## Responsive Design

Support:

- Mobile
- Tablet
- Laptop
- Desktop
- Ultrawide

Navigation and layouts must adapt gracefully without horizontal scrolling.
Accessibility

The interface must:

- Meet WCAG AA contrast standards.
- Respect prefers-reduced-motion by minimizing non-essential animations.
- Be fully keyboard navigable with visible focus states.
- Use semantic HTML and ARIA attributes where appropriate.
- Ensure all interactive elements have accessible labels.

---

## Performance

UI quality must never compromise speed.

Requirements:

- Lighthouse Performance ≥95
- Lighthouse Accessibility ≥95
- Lighthouse Best Practices ≥95
- Lighthouse SEO ≥95

Optimize by:

- Lazy-loading images and heavy components.
- Using modern image formats (WebP/AVIF).
- Minimizing JavaScript bundles.
- Leveraging Astro's partial hydration (hydrate only interactive components).
- Using CSS transforms and opacity for animations instead of layout-triggering properties.
- Respecting prefers-reduced-motion.
- Maintaining smooth 60fps scrolling and interactions.

Overall User Experience

Every interaction should feel polished and purposeful. The portfolio should communicate craftsmanship through subtle motion, responsive behavior, and consistent visual language. The experience should resemble a modern Android 17/Material You interface with premium frosted glass aesthetics while remaining lightweight, fast, and accessible across all devices.

End of AGENT.md
