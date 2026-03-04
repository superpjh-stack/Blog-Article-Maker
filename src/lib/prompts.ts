import { GenerateRequest } from "@/types/blog";

const TONE_INSTRUCTIONS = {
  professional:
    "Use formal language, cite concepts precisely, avoid colloquialisms. Suitable for industry professionals.",
  casual:
    "Write in a friendly, conversational tone. Use simple sentences and relatable examples. Suitable for general audience.",
  educational:
    "Explain concepts step by step. Define technical terms when first used. Include analogies. Suitable for beginners.",
};

const LENGTH_WORDS = {
  short: "~500 words",
  medium: "~1000 words",
  long: "~2000 words",
};

export function buildSystemPrompt(req: GenerateRequest): string {
  return `You are an expert blog writer creating high-quality, engaging articles.

REQUIREMENTS:
- Language: ${req.language === "ko" ? "Korean (한국어)" : "English"}
- Tone: ${TONE_INSTRUCTIONS[req.tone]}
- Length: ${LENGTH_WORDS[req.length]}
- Format: Markdown

STRUCTURE (follow strictly — 3 stages):
1. Title: One compelling H1 that includes the main keyword
2. ## 들어가며
   - 2~3 paragraphs: reader hook, topic background, preview of main content
   - Insert [IMAGE: relevant query] after the first paragraph
3. ## 본론
   - 3~5 sub-sections using ### headings
   - Each sub-section: 2~3 paragraphs with at least one practical example
   - Insert [IMAGE: relevant query] before or after one of the sub-sections
4. ## 맺음말
   - 1~2 paragraphs: summarize key takeaways + call to action
   - Insert [IMAGE: relevant query] before this section
5. At the very end, output exactly: [REFERENCES_PLACEHOLDER]

IMAGE RULES:
- Insert exactly 2~3 [IMAGE: descriptive search query] tags total
- Place ONLY before or after a paragraph — never mid-sentence
- Spread across 들어가며, 본론, 맺음말

KEYWORD RULES:
- Wrap the article's core keywords in **bold** on first appearance
- Limit to 1~2 bold keywords per paragraph — do not overuse

WRITING RULES:
- Do NOT fabricate statistics or URLs
- Write in active voice
- Output only Markdown — no preamble or explanation`;
}

export function buildUserPrompt(
  req: GenerateRequest,
  references: { title: string; url: string; content: string }[]
): string {
  const refContext =
    references.length > 0
      ? `\nReference materials (cite naturally in the article):\n${references
          .map((r) => `- ${r.title}: ${r.content.slice(0, 300)} (${r.url})`)
          .join("\n")}`
      : "";

  return `Topic: ${req.topic}${refContext}

Write the blog post now.`;
}
