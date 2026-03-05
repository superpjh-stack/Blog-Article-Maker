import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.TISTORY_CLIENT_ID;
  if (!clientId) {
    return new Response("TISTORY_CLIENT_ID not configured", { status: 500 });
  }
  const redirectUri = encodeURIComponent(
    `${req.nextUrl.origin}/api/tistory/callback`
  );
  return NextResponse.redirect(
    `https://www.tistory.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
  );
}
