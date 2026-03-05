"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConnectContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const blog = params.get("blog");
    if (token) localStorage.setItem("tistory_token", token);
    if (blog) localStorage.setItem("tistory_blog", blog);
    const returnTo = sessionStorage.getItem("tistory_return") || "/";
    sessionStorage.removeItem("tistory_return");
    router.replace(returnTo);
  }, [params, router]);

  return (
    <div className="text-center py-20 text-gray-400">Tistory 연결 중...</div>
  );
}

export default function TistoryConnectPage() {
  return (
    <Suspense
      fallback={<div className="text-center py-20 text-gray-400">로딩 중...</div>}
    >
      <ConnectContent />
    </Suspense>
  );
}
