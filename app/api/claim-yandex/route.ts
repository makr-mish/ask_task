import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = process.env.API_TOKEN;
    const base = process.env.API_BASE;

    if (!token || !base) {
      return NextResponse.json(
        { error: "Env vars are missing" },
        { status: 500 }
      );
    }

    const userId = body.USER_ID_TEXT;

    if (!userId) {
      return NextResponse.json(
        { error: "USER_ID_TEXT is missing" },
        { status: 400 }
      );
    }

    const backendUrl = `${base}/yandex/getfreefeedback/${userId}/${token}`;

    const backendBody = {
      gender_acc: ["Любой", body.gender_acc],
      telegram_id: body.USER_ID_TEXT,
      telegram_username: body.USERNAME_TEXT ?? "",
      account_name: body.account_name,
      amount: body.amount ?? "",
      region: body.region,
    };

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendBody),
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
        backendUrl,
        sentBody: backendBody,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("claim-yandex proxy error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}