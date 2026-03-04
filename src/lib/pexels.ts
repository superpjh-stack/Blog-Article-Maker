import { ImageResult } from "@/types/blog";

export async function fetchImages(
  query: string,
  count = 1
): Promise<ImageResult[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: key } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.photos ?? []).map((photo: Record<string, unknown>) => ({
      url: (photo.src as Record<string, string>).large,
      alt: (photo.alt as string) || query,
      credit: `Photo by ${(photo.photographer as string)} on Pexels`,
    }));
  } catch {
    return [];
  }
}
