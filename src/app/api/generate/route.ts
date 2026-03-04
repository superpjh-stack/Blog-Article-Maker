import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { searchReferences } from "@/lib/tavily";
import { GenerateRequest } from "@/types/blog";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body: GenerateRequest = await req.json();

  if (!body.topic || body.topic.trim().length < 3) {
    return new Response(JSON.stringify({ error: "Topic too short" }), {
      status: 400,
    });
  }

  // References only (images are fetched client-side per [IMAGE: query] tag)
  const references = await searchReferences(body.topic);

  const systemPrompt = buildSystemPrompt(body);
  const userPrompt = buildUserPrompt(body, references);

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    prompt: userPrompt,
  });

  const response = result.toTextStreamResponse();
  const headers = new Headers(response.headers);
  headers.set(
    "X-Blog-References",
    encodeURIComponent(
      JSON.stringify(
        references.map((r) => ({
          title: r.title,
          url: r.url,
          snippet: r.content.slice(0, 200),
        }))
      )
    )
  );

  return new Response(response.body, { status: response.status, headers });
}
