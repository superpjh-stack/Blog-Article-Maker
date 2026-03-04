import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerardo의 AI Blog Maker",
  description: "주제를 입력하면 AI가 아티클·이미지·참고자료를 자동 생성합니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-white text-black`}>
        <header className="border-b sticky top-0 bg-white z-10">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <a href="/" className="font-bold tracking-tight text-sm sm:text-lg leading-tight">
              <span className="hidden sm:inline">✍️ Gerardo의 AI Blog Maker</span>
              <span className="sm:hidden">✍️ AI Blog</span>
            </a>
            <div className="flex items-center gap-3 shrink-0">
              <a href="/history" className="text-sm text-gray-600 hover:text-black transition-colors">
                이력
              </a>
              <span className="text-xs text-gray-400 hidden sm:inline">GPT-4o</span>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
