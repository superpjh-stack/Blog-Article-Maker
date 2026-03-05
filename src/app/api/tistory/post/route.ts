import { NextRequest, NextResponse } from "next/server";

function markdownToHtml(md: string): string {
  return md
    .replace(
      /^!\[([^\]]*)\]\(([^)]+)\)\n\*([^*]+)\*$/gm,
      '<figure><img src="$2" alt="$1" style="max-width:100%;border-radius:8px"/><figcaption style="font-size:12px;color:#888;text-align:center;margin-top:4px">$3</figcaption></figure>'
    )
    .replace(
      /^!\[([^\]]*)\]\(([^)]+)\)$/gm,
      '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px"/>'
    )
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[huilfp])(.+)$/gm, "<p>$1</p>");
}

export async function POST(req: NextRequest) {
  const { accessToken, blogName, title, content } = await req.json();
  const html = markdownToHtml(content);

  const params = new URLSearchParams({
    access_token: accessToken,
    output: "json",
    blogName,
    title,
    content: html,
    visibility: "3",
    categoryId: "0",
  });

  const res = await fetch(
    `https://www.tistory.com/apis/post/write?${params}`,
    { method: "POST" }
  );

  const data = await res.json();

  if (data?.tistory?.status === "401") {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }
  if (data?.tistory?.status !== "200") {
    return NextResponse.json({ error: "post_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: data.tistory?.item?.url });
}
