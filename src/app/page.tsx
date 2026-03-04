"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GenerateRequest } from "@/types/blog";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<GenerateRequest["tone"]>("professional");
  const [length, setLength] = useState<GenerateRequest["length"]>("medium");
  const [language, setLanguage] = useState<GenerateRequest["language"]>("ko");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 3) {
      setError("주제를 3글자 이상 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);

    // Store request params so the generate page can pick them up
    const params = { topic: topic.trim(), tone, length, language };
    sessionStorage.setItem("generateParams", JSON.stringify(params));
    router.push("/generate");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">Gerardo의 AI Blog Maker</h1>
        <p className="text-sm sm:text-base text-gray-500">주제를 입력하면 AI가 아티클·이미지·참고자료를 자동 생성합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic input */}
        <div>
          <label className="block text-sm font-medium mb-1">블로그 주제</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="예: 2025년 AI 트렌드가 마케팅에 미치는 영향"
            className="w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-black"
            maxLength={200}
            disabled={loading}
          />
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{error && <span className="text-red-500">{error}</span>}</span>
            <span>{topic.length}/200</span>
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">톤</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as GenerateRequest["tone"])}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={loading}
            >
              <option value="professional">전문적</option>
              <option value="casual">캐주얼</option>
              <option value="educational">교육적</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">길이</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as GenerateRequest["length"])}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={loading}
            >
              <option value="short">짧게 (~500자)</option>
              <option value="medium">보통 (~1000자)</option>
              <option value="long">길게 (~2000자)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">언어</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as GenerateRequest["language"])}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              disabled={loading}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || topic.trim().length < 3}
          className="w-full bg-black text-white rounded-lg py-3 font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "이동 중..." : "블로그 생성하기 →"}
        </button>
      </form>

      {/* Example topics */}
      <div className="mt-10">
        <p className="text-xs text-gray-400 mb-2">예시 주제</p>
        <div className="flex flex-wrap gap-2">
          {[
            "리모트 워크의 생산성 향상 전략",
            "초보자를 위한 파이썬 머신러닝 입문",
            "지속 가능한 여행의 미래",
            "ChatGPT가 교육을 바꾸는 방법",
          ].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className="text-xs border rounded-full px-3 py-1 hover:bg-gray-50 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
