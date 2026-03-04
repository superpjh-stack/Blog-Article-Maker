# Making Blogs

## Project Level
**Starter** — Static blog site using Next.js 14 + Tailwind CSS.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Deployment: Vercel (recommended)

## Project Structure
```
src/
  app/
    layout.tsx          # Root layout (header + footer)
    page.tsx            # Home / post list
    about/page.tsx      # About page
    posts/[slug]/       # Individual post pages
    globals.css         # Tailwind base styles
docs/
  01-plan/              # PDCA Plan documents
  02-design/            # PDCA Design documents
```

## Key Conventions
- All pages live in `src/app/`
- Use Tailwind utility classes — no separate CSS files unless needed
- Keep components simple; no abstractions until reused 3+ times
- `max-w-3xl mx-auto` container for readable line length

## Commands
```bash
npm install      # Install dependencies
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
```

## Next Steps
1. `npm install` then `npm run dev`
2. Edit `src/app/page.tsx` to add real posts
3. Add MDX support if you want markdown-based posts
4. Deploy to Vercel when ready
