"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/types/blog";
import { getAllPosts, deletePost } from "@/lib/history";

function EmptyState() {
  return (
    <div className="text-center py-24 text-gray-400">
      <p className="text-4xl mb-4">📄</p>
      <p className="font-medium text-gray-600 mb-1">아직 생성한 블로그가 없어요</p>
      <p className="text-sm mb-6">주제를 입력하면 AI가 블로그를 자동으로 만들어드립니다</p>
      <a
        href="/"
        className="inline-block bg-black text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
      >
        블로그 생성하기 →
      </a>
    </div>
  );
}

function HistoryCard({
  post,
  onDelete,
  onView,
}: {
  post: BlogPost;
  onDelete: (id: string) => void;
  onView: (post: BlogPost) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const wordCount = post.content.split(/\s+/).length;
  const readMin = Math.max(1, Math.round(wordCount / 200));
  const date = new Date(post.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="border rounded-xl p-4 hover:border-gray-400 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
              {post.topic}
            </span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <p className="font-medium text-sm leading-snug line-clamp-2 mb-1">
            {post.title || post.topic}
          </p>
          <p className="text-xs text-gray-400">
            {wordCount.toLocaleString()}자 · 약 {readMin}분
            {post.images.length > 0 && ` · 이미지 ${post.images.length}장`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 self-end sm:self-start">
          <button
            onClick={() => onView(post)}
            className="text-xs border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            보기
          </button>
          {confirming ? (
            <button
              onClick={() => onDelete(post.id)}
              className="text-xs bg-red-500 text-white rounded-lg px-3 py-1.5 hover:bg-red-600 transition-colors"
              onBlur={() => setTimeout(() => setConfirming(false), 200)}
            >
              확인
            </button>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs border border-gray-200 text-gray-400 rounded-lg px-3 py-1.5 hover:border-red-300 hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPosts(getAllPosts());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleView(post: BlogPost) {
    sessionStorage.setItem("blogResult", JSON.stringify(post));
    router.push(`/result/${post.id}?from=history`);
  }

  if (!loaded) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl p-4 animate-pulse bg-gray-50 h-20" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">생성 이력</h1>
        <span className="text-sm text-gray-400">{posts.length}개</span>
      </div>

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <HistoryCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
