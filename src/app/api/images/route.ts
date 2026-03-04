import { NextRequest, NextResponse } from "next/server";
import { fetchImages } from "@/lib/pexels";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ image: null });

  const images = await fetchImages(q, 1);
  return NextResponse.json({ image: images[0] ?? null });
}
