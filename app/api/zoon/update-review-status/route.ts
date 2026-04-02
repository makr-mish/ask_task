import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const { userIdText, fb_id, fb_status } = await req.json();
    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 },
      );
    }

    const res = await fetch(`${API_BASE}/updatefeedback/${userIdText}/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fb_id, fb_status }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.message || data?.error || "Ошибка обновления статуса Zoon",
          raw: data,
        },
        { status: res.status || 500 },
      );
    }

    return NextResponse.json({ ok: true, result: data?.result, raw: data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Ошибка обновления статуса Zoon",
      },
      { status: 500 },
    );
  }
}
