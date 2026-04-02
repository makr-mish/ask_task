import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ platform: string }> }
) {
  try {
    const { platform } = await context.params;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "No userId" }, { status: 400 });
    }

    const token = process.env.API_TOKEN;
    const base = process.env.API_BASE;

    if (!token || !base) {
      return NextResponse.json(
        { error: "Env vars are missing", tokenExists: !!token, baseExists: !!base },
        { status: 500 }
      );
    }

    const backendUrl = `${base}/feedbacks/free/${platform}/${userId}/${token}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();

    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {}

    return NextResponse.json(
      {
        ok: res.ok,
        status: res.status,
        backendUrl,
        data,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("API proxy error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}