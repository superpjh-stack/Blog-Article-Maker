"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GenerateRequest, ImageResult, Reference } from "@/types/blog";

const STEPS = [
  "참고자료 수집 중...",
  "아티클 작성 중...",
  "이미지 매칭 중...",
  "마무리 중...",
];

async function fetchImageForQuery(query: string): Promise<ImageResult | null> {
  try {
    const res = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.image ?? null;
  } catch {
    return null;
  }
}

export default function GeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const raw = sessionStorage.getItem("generateParams");
    if (!raw) { router.push("/"); return; }
    generate(JSON.parse(raw) as GenerateRequest);
  }, [router]);

  async function generate(params: GenerateRequest) {
    try {
      const stepTimer = setInterval(() => {
        setStep((s) => Math.min(s + 1, 1)); // stay at step 1 during streaming
      }, 3000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "생성 실패");
      }

      const refsHeader = res.headers.get("X-Blog-References");
      const references: Reference[] = refsHeader
        ? JSON.parse(decodeURIComponent(refsHeader))
        : [];

      // Stream body
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      setStep(1);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setPreview((p) => p + chunk);
      }

      // Step 2: fetch images for each [IMAGE: query] tag individually
      setStep(2);
      const imageTagRegex = /\[IMAGE:\s*([^\]]+)\]/g;
      const queries: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = imageTagRegex.exec(fullText)) !== null) {
        queries.push(m[1].trim());
      }

      // Fetch all images in parallel, each with its specific query
      const fetchedImages = await Promise.all(queries.map(fetchImageForQuery));
      const allImages: ImageResult[] = fetchedImages.filter(Boolean) as ImageResult[];

      // Replace each [IMAGE: query] tag with its specific fetched image
      // If no matching image found, remove the tag entirely (no placeholder)
      let processed = fullText;
      let imgIdx = 0;
      processed = processed.replace(/\[IMAGE:\s*([^\]]+)\]/g, () => {
        const img = allImages[imgIdx] ?? null;
        imgIdx++;
        if (!img) return ""; // 관련 이미지 없으면 태그 제거
        return `\n![${img.alt}](${img.url})\n*${img.credit}*\n`;
      });

      // Replace references placeholder
      const refMarkdown = references.length > 0
        ? references.map((r, i) => `${i + 1}. [${r.title}](${r.url})`).join("\n")
        : "";
      processed = processed.replace("[REFERENCES_PLACEHOLDER]", refMarkdown);

      setStep(3);

      const result = {
        id: Date.now().toString(),
        topic: params.topic,
        title: params.topic,
        content: processed,
        images: allImages,
        references,
        createdAt: new Date().toISOString(),
      };
      sessionStorage.setItem("blogResult", JSON.stringify(result));
      router.push(`/result/${result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    }
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="border rounded-lg px-4 py-2 hover:bg-gray-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="font-medium text-sm sm:text-base">{STEPS[step]}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-700"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {preview && (
        <div className="border rounded-xl p-4 sm:p-6 bg-gray-50 max-h-72 overflow-y-auto">
          <p className="text-xs text-gray-400 mb-2">실시간 미리보기</p>
          <pre className="text-xs sm:text-sm whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {preview}
          </pre>
        </div>
      )}
    </div>
  );
}
