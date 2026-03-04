# AI Blog Generator - System Architecture

## 1. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | Already set up; API Routes for backend, RSC for fast loads |
| Language | TypeScript | Type safety across front/back |
| Styling | Tailwind CSS | Already set up; rapid UI development |
| LLM | Claude API (claude-sonnet-4-6) | High-quality article generation, cost-effective |
| AI SDK | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | Built-in streaming, Next.js-native integration |
| Images | Unsplash API | Free tier (50 req/hr), high-quality photos, no attribution hassle with API |
| Web Search | Tavily API | Purpose-built for AI apps, returns structured results with URLs + snippets |
| State | React `useState` + localStorage | No DB needed for MVP; posts saved client-side |
| Deployment | Vercel | Zero-config Next.js hosting, edge functions, env vars UI |

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│  ┌─────────────┐    ┌──────────────┐   ┌────────────┐  │
│  │ TopicInput  │───▶│ GeneratePage │──▶│ PostViewer │  │
│  │ (form)      │    │ (streaming)  │   │ (result)   │  │
│  └─────────────┘    └──────┬───────┘   └────────────┘  │
│                            │ SSE stream                 │
└────────────────────────────┼────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Next.js API    │
                    │  Routes         │
                    │  /api/generate  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼──────┐ ┌────▼─────┐ ┌──────▼───────┐
     │  Claude API   │ │ Unsplash │ │  Tavily API  │
     │  (Anthropic)  │ │   API    │ │ (Web Search) │
     │               │ │          │ │              │
     │ Article gen   │ │ Photos   │ │ References   │
     │ + Keywords    │ │ by topic │ │ + Sources    │
     └───────────────┘ └──────────┘ └──────────────┘
```

### Data Flow (POST /api/generate)

```
1. User submits topic
       │
2. ────▶ Tavily: search topic → get references & source URLs
       │
3. ────▶ Claude: generate article (with references as context)
       │         stream response via SSE
       │
4. ────▶ Unsplash: search images by topic keywords
       │
5. ◀──── Return combined result: article + images + references
```

Steps 2 and 4 can run in parallel (Promise.all) since they are independent.
Step 3 depends on step 2 (references feed into the article prompt).

## 3. Claude API Integration

### Model
- **Model**: `claude-sonnet-4-6`
- **Max output tokens**: 4096 (sufficient for ~2000-word article)

### Streaming Strategy
Use **Vercel AI SDK** with `@ai-sdk/anthropic` provider:

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  system: BLOG_SYSTEM_PROMPT,
  prompt: userPrompt,
  maxTokens: 4096,
});

return result.toDataStreamResponse();
```

Client-side consumption with `useChat` or `useCompletion` from `ai/react`.

### Prompt Design

**System Prompt** (blog writer persona):
```
You are a professional blog writer. Write a well-structured article about the given topic.

Requirements:
- Use markdown format with proper headings (##, ###)
- Include an engaging introduction and conclusion
- Write 1500-2000 words
- Use a professional but accessible tone
- Naturally incorporate the provided reference sources as citations
- Include [Source](URL) links where you reference external information
```

**User Prompt** (constructed per request):
```
Topic: {userTopic}

Reference materials (use these as sources in your article):
{tavilyResults.map(r => `- ${r.title}: ${r.content} (${r.url})`).join('\n')}

Write a comprehensive blog article about this topic.
```

### Cost Estimate
- Input: ~2000 tokens (prompt + references)
- Output: ~3000 tokens (article)
- Per article: ~$0.02 with claude-sonnet-4-6
- 1000 articles/month: ~$20

## 4. API Route Design

### POST /api/generate

Main generation endpoint. Streams the article back via SSE.

**Request:**
```typescript
{
  topic: string;        // Required. User's blog topic
  language?: string;    // Optional. "en" | "ko" | "es" etc. Default: "en"
}
```

**Response:** Server-Sent Events stream (Vercel AI SDK data stream format)

Final assembled result (sent as last event):
```typescript
{
  article: string;          // Markdown content
  images: Array<{
    url: string;
    alt: string;
    credit: string;         // Photographer attribution
    downloadUrl: string;
  }>;
  references: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}
```

### GET /api/posts

Returns saved posts from local storage (future: database).

**Response:**
```typescript
{
  posts: BlogPost[];
}
```

### POST /api/posts

Save a generated post.

**Request:**
```typescript
{
  title: string;
  topic: string;
  content: string;        // Markdown
  images: ImageResult[];
  references: Reference[];
}
```

**Response:**
```typescript
{
  id: string;
  createdAt: string;
}
```

> **MVP Note**: For the initial version, posts are stored in-memory or via a simple JSON file. A database (e.g., Vercel KV or SQLite) can be added later.

## 5. Data Models

```typescript
// === Core Types ===

interface GenerateRequest {
  topic: string;
  language?: string;
}

interface BlogPost {
  id: string;
  title: string;
  topic: string;
  content: string;           // Markdown article body
  images: ImageResult[];
  references: Reference[];
  createdAt: string;          // ISO 8601
}

interface ImageResult {
  url: string;                // Unsplash regular size URL
  alt: string;
  credit: string;             // "Photo by X on Unsplash"
  downloadUrl: string;        // Unsplash download endpoint (for tracking)
}

interface Reference {
  title: string;
  url: string;
  snippet: string;            // Brief excerpt from the source
}

// === API Response Types ===

interface GenerateStreamData {
  article: string;
  images: ImageResult[];
  references: Reference[];
}

interface SavePostResponse {
  id: string;
  createdAt: string;
}
```

## 6. Environment Variables

```env
# LLM - Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Images - Unsplash
UNSPLASH_ACCESS_KEY=...

# Web Search - Tavily
TAVILY_API_KEY=tvly-...
```

All keys are server-side only (no `NEXT_PUBLIC_` prefix). They are accessed exclusively through API Routes.

### Setup Instructions
1. Anthropic: https://console.anthropic.com/settings/keys
2. Unsplash: https://unsplash.com/developers (create app, get Access Key)
3. Tavily: https://tavily.com (sign up, get API key - 1000 free searches/month)

## 7. Deployment Strategy (Vercel)

### Configuration
- **Runtime**: Node.js (default)
- **Function timeout**: 60s (Hobby plan) / 300s (Pro plan)
  - Article generation may take 15-30s with streaming; 60s is sufficient
- **Region**: `iad1` (US East) or nearest to user base

### Streaming
- Vercel supports SSE/streaming responses natively with API Routes
- Use `export const maxDuration = 60;` in the generate route to extend timeout
- Vercel AI SDK `toDataStreamResponse()` works out of the box

### Environment Variables
Set in Vercel Dashboard > Project Settings > Environment Variables:
- `ANTHROPIC_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `TAVILY_API_KEY`

### Key Considerations
1. **No cold start issues** - Serverless functions warm up fast enough for API calls
2. **Rate limiting** - Add basic rate limiting (e.g., 10 generations/minute per IP) to prevent API cost spikes
3. **Error handling** - Gracefully handle API failures (Claude timeout, Unsplash rate limit, Tavily quota)
4. **CORS** - Not needed since API Routes run same-origin

### Required Packages to Install
```bash
npm install ai @ai-sdk/anthropic
```

No SDK needed for Unsplash and Tavily — use simple `fetch` calls to keep dependencies minimal.
