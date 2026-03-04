"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlogPost } from "@/types/blog";
import { savePost } from "@/lib/history";

function MarkdownRenderer({ content }: { content: string }) {
  const html = content
    // 1. 이미지+크레딧 (이탤릭 치환 전에 먼저 처리)
    .replace(/^!\[([^\]]*)\]\(([^)]+)\)\n\*([^*]+)\*$/gm,
      "<figure class='my-6'><img src='$2' alt='$1' class='w-full rounded-xl shadow-sm'/><figcaption class='text-xs text-gray-400 mt-2 text-center'>$3</figcaption></figure>")
    // 2. 이미지 단독 (크레딧 없는 경우)
    .replace(/^!\[([^\]]*)\]\(([^)]+)\)$/gm,
      "<figure class='my-6'><img src='$2' alt='$1' class='w-full rounded-xl shadow-sm'/></figure>")
    // 3. 제목
    .replace(/^# (.+)$/gm, "<h1 class='text-3xl font-bold mt-8 mb-3'>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2 class='text-2xl font-semibold mt-6 mb-2'>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3 class='text-xl font-semibold mt-4 mb-1'>$1</h3>")
    // 4. 인라인 서식 (bold → italic 순서)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // 5. 링크
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' class='text-blue-600 underline' target='_blank' rel='noopener'>$1</a>")
    // 6. 목록
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    // 7. 단락
    .replace(/\n\n/g, "</p><p class='my-3'>")
    .replace(/^(?!<[hluif])(.+)$/gm, "<p class='my-3'>$1</p>");

  return (
    <div
      className="prose prose-gray max-w-none text-gray-800 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromHistory = searchParams.get("from") === "history";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState<"md" | "html" | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("blogResult");
    if (!raw) { router.push("/"); return; }
    const parsed: BlogPost = JSON.parse(raw);
    setPost(parsed);
    savePost(parsed); // 자동 저장
  }, [router]);

  function copyMarkdown() {
    if (!post) return;
    navigator.clipboard.writeText(post.content);
    setCopied("md");
    setTimeout(() => setCopied(null), 2000);
  }

  function downloadMarkdown() {
    if (!post) return;
    const blob = new Blob([post.content], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${post.topic.slice(0, 40).replace(/\s+/g, "-")}.md`;
    a.click();
  }

  if (!post) {
    return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  }

  const wordCount = post.content.split(/\s+/).length;
  const readMin = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="max-w-3xl mx-auto">
      {/* Meta bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span className="font-medium text-black">{post.topic}</span>
          <span>{wordCount.toLocaleString()}자</span>
          <span>약 {readMin}분</span>
          {post.images.length > 0 && <span>이미지 {post.images.length}</span>}
          {post.references.length > 0 && <span>참고 {post.references.length}</span>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={copyMarkdown}
            className="text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            {copied === "md" ? "✓ 복사됨" : "MD 복사"}
          </button>
          <button
            onClick={downloadMarkdown}
            className="text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            다운로드
          </button>
          {fromHistory ? (
            <button
              onClick={() => router.push("/history")}
              className="text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              ← 이력으로
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="text-sm bg-black text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors"
            >
              새 글 생성 →
            </button>
          )}
        </div>
      </div>

      {/* Article */}
      <article>
        <MarkdownRenderer content={post.content} />
      </article>

      {/* References — always shown at the bottom */}
      <div className="mt-12 border-t pt-6">
        <h3 className="font-semibold mb-3">📚 참고 아티클</h3>
        {post.references.length > 0 ? (
          <ol className="space-y-3">
            {post.references.map((ref, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-gray-400 shrink-0">{i + 1}.</span>
                <div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {ref.title}
                  </a>
                  {ref.snippet && (
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                      {ref.snippet}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-400">참고 아티클이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
