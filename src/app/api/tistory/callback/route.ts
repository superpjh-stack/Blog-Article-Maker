import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/?error=tistory_denied", req.url));
  }

  const redirectUri = `${req.nextUrl.origin}/api/tistory/callback`;
  const params = new URLSearchParams({
    client_id: process.env.TISTORY_CLIENT_ID!,
    client_secret: process.env.TISTORY_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    code,
    grant_type: "authorization_code",
  });

  try {
    const tokenRes = await fetch(
      `https://www.tistory.com/oauth/access_token?${params}`
    );
    const tokenText = await tokenRes.text();
    const token = new URLSearchParams(tokenText).get("access_token");
    if (!token) throw new Error("No token");

    // Fetch blog name
    let blogName = "";
    try {
      const infoRes = await fetch(
        `https://www.tistory.com/apis/blog/info?access_token=${token}&output=json`
      );
      const infoData = await infoRes.json();
      blogName = infoData?.tistory?.item?.blogs?.blog?.[0]?.name ?? "";
    } catch { /* ignore */ }

    return NextResponse.redirect(
      new URL(
        `/tistory/connect?token=${encodeURIComponent(token)}&blog=${encodeURIComponent(blogName)}`,
        req.url
      )
    );
  } catch {
    return NextResponse.redirect(
      new URL("/?error=tistory_auth_failed", req.url)
    );
  }
}
