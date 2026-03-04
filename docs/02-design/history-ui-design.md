# History Feature — UI & Component Design

## 1. Navigation Change

### Current Header Structure
```
[Logo / Site Title]                    [Powered by GPT-4o]
```

### Recommended: Option A — "이력" Link in Header Right

**Updated Header:**
```
[Logo / Site Title]           [이력]   [Powered by GPT-4o]
```

**Why Option A:**
- The app has only 3 pages (home, generate, history). A full hamburger menu is excessive overhead.
- Tabs on the home page (Option C) would mix two distinct concerns: "start a new post" vs "view past posts". The user journey is linear — generate → view result → optionally browse history.
- A single text link in the header matches the existing minimal aesthetic, requires zero new mobile/responsive logic, and is immediately discoverable.
- "이력" sits between the center and the "Powered by GPT-4o" badge — it does not compete visually with the logo.

**Implementation note:** Add `<Link href="/history">이력</Link>` in the existing header component. No layout changes needed beyond one element.

---

## 2. ASCII Wireframes

### Screen A: History List Page (`/history`)

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]                    [이력]      [Powered by GPT-4o]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   생성 이력                                    [전체 삭제]   │
│   ─────────────────────────────────────────────────────────  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [썸네일 이미지]   제목: AI가 바꾸는 미래 의료...     │   │
│  │                   주제: 의료 AI                       │   │
│  │                   생성일: 2026-03-04 14:23            │   │
│  │                                          [보기] [삭제]│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [썸네일 이미지]   제목: 기후변화와 탄소 중립의...    │   │
│  │                   주제: 기후변화                      │   │
│  │                   생성일: 2026-03-03 09:11            │   │
│  │                                          [보기] [삭제]│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [썸네일 이미지]   제목: 블록체인 기술의 현재와...    │   │
│  │                   주제: 블록체인                      │   │
│  │                   생성일: 2026-03-02 18:45            │   │
│  │                                          [보기] [삭제]│   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ─ 최대 50개 저장 · 현재 3개 ──────────────────────────────  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

── Empty State (이력 없을 때) ──────────────────────────────────
│                                                              │
│                   [📝 아이콘]                                │
│              아직 생성된 블로그가 없어요                      │
│           첫 번째 블로그 포스트를 만들어 보세요!             │
│                  [새 블로그 생성하기 →]                      │
│                                                              │
```

**Card fields displayed:**
- Thumbnail: `images[0].url` — 64×64px, object-cover (fallback: gray placeholder)
- Title: `title` — 1 line truncated (`truncate`)
- Topic: `topic` — badge style
- Created: `createdAt` formatted as `YYYY-MM-DD HH:mm`
- Actions: "보기" → `/history/[id]`, "삭제" → optimistic remove

---

### Screen B: History Detail Page (`/history/[id]`)

**Decision: Reuse `/result/[id]` — no separate route needed.**

The existing `/result/[id]` page already renders a `BlogPost` by ID. The only difference is:

| Aspect | `/result/[id]` | `/history/[id]` |
|--------|---------------|-----------------|
| Data source | `localStorage` (freshly saved post) | `localStorage` (previously saved post) |
| Back button target | `/generate` or `/` | `/history` |
| "다시 생성" CTA | Prominent | Secondary / hidden |

**Recommended approach:** Pass a `from=history` query param and render the back button conditionally, rather than duplicating the entire page.

```
/result/[id]?from=history  →  back button shows "← 이력으로 돌아가기"
/result/[id]               →  back button shows "← 홈으로"
```

This avoids a `/history/[id]` page entirely. The component tree stays DRY.

---

## 3. Component Tree

```
src/app/history/
  page.tsx                  ← HistoryPage (Client Component)

src/components/history/
  HistoryList.tsx           ← map over posts → HistoryCard[]
  HistoryCard.tsx           ← single post card with actions
  EmptyState.tsx            ← zero-posts UI
  DeleteButton.tsx          ← confirmation + optimistic delete
```

### Component Responsibilities

**`src/app/history/page.tsx`**
```tsx
'use client'
// Reads localStorage on mount via useEffect
// Owns posts: BlogPost[] state
// Passes deletePost handler down to HistoryList
```

**`src/components/history/HistoryList.tsx`**
```tsx
// Props: posts: BlogPost[], onDelete: (id: string) => void
// Renders EmptyState when posts.length === 0
// Renders HistoryCard[] sorted by createdAt desc
```

**`src/components/history/HistoryCard.tsx`**
```tsx
// Props: post: BlogPost, onDelete: (id: string) => void
// Thumbnail from post.images[0] or placeholder
// Link to /result/[id]?from=history
// Renders DeleteButton
```

**`src/components/history/EmptyState.tsx`**
```tsx
// No props needed
// Icon + message + Link to /generate
```

**`src/components/history/DeleteButton.tsx`**
```tsx
// Props: postId: string, onDelete: (id: string) => void
// Inline confirm state: idle → confirming → (calls onDelete)
// No modal — toggling button label is sufficient
```

---

## 4. localStorage Utility Design

**`src/lib/history.ts`**

```typescript
import { BlogPost } from '@/types/blog'

export const MAX_POSTS = 50

// Save a post to localStorage.
// If MAX_POSTS is reached, removes the oldest entry before inserting.
export function savePost(post: BlogPost): void

// Return all posts sorted by createdAt descending.
export function getAllPosts(): BlogPost[]

// Remove a single post by id.
export function deletePost(id: string): void

// Wipe the entire history from localStorage.
export function clearAll(): void
```

**Storage key:** `'blog_history'`
**Serialization:** `JSON.stringify` / `JSON.parse` on `BlogPost[]`
**Error boundary:** wrap all reads in `try/catch` — `localStorage` can throw in private browsing or when storage is full. Return `[]` as safe fallback.

---

## 5. State & Data Flow

### Why HistoryPage Must Be a Client Component

`localStorage` is a browser-only API. React Server Components (RSC) run on the server (or at build time) and have no access to `window` or `localStorage`. Attempting to call `localStorage` in an RSC throws a runtime error.

Therefore:
- `src/app/history/page.tsx` must carry the `'use client'` directive.
- Data is loaded in `useEffect` on first mount (not during SSR/SSG).
- This means the page initially renders with an empty list (or a loading skeleton), then hydrates with real data.

**Pattern:**
```tsx
'use client'
const [posts, setPosts] = useState<BlogPost[]>([])
const [loaded, setLoaded] = useState(false)

useEffect(() => {
  setPosts(getAllPosts())
  setLoaded(true)
}, [])
```
Show a skeleton or null before `loaded` is true to avoid a flash of empty state.

---

### Optimistic Delete

Optimistic update means updating the UI immediately without waiting for any async confirmation. Since `localStorage` is synchronous, the pattern is:

```
User clicks [삭제]
  → (1) setPosts(prev => prev.filter(p => p.id !== id))   // UI updates instantly
  → (2) deletePost(id)                                    // localStorage write
```

No rollback logic is needed because `localStorage.removeItem` is synchronous and essentially infallible (the only failure mode is a corrupted storage, which would affect reads too). The optimistic update is safe.

**DeleteButton confirm flow (no modal needed):**
```
[삭제]  →  click  →  [정말 삭제할까요?] [취소]
                         click          click
                           ↓              ↓
                      onDelete(id)    reset to idle
```
A 3-second auto-reset on the confirm state prevents stuck UI if the user clicks away.

---

## Summary of Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Navigation | Option A: header link | Minimal; fits existing structure |
| Detail page | Reuse `/result/[id]?from=history` | DRY; avoids duplicate page |
| List UI | Card list | Thumbnail visible; scannable |
| Delete UX | Inline confirm (no modal) | Lightweight; no z-index/overlay complexity |
| Storage error handling | try/catch → fallback `[]` | Private browsing safety |
| Optimistic update | Immediate setState + sync localStorage | No async needed; safe |
