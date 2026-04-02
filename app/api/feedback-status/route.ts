import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const fbId = url.searchParams.get("fbId");

    if (!userId || !fbId) {
      return NextResponse.json(
        { error: "userId or fbId is missing" },
        { status: 400 }
      );
    }

    const token = process.env.API_TOKEN;
    const base = process.env.API_BASE;

    if (!token || !base) {
      return NextResponse.json(
        { error: "Env vars are missing" },
        { status: 500 }
      );
    }

    const backendUrl = `${base}/getfeedback/${userId}/${token}/${fbId}`;

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
        data,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("feedback-status proxy error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}