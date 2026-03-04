import { ImageResult } from "@/types/blog";

export async function fetchImages(
  query: string,
  count = 1
): Promise<ImageResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return []; // 키 없으면 이미지 없음

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((photo: Record<string, unknown>) => ({
      url: (photo.urls as Record<string, string>).regular,
      alt: (photo.alt_description as string) || query,
      credit: `Photo by ${(photo.user as Record<string, string>).name} on Unsplash`,
    }));
  } catch {
    return [];
  }
}
