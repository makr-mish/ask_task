import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const { userIdText, fb_id } = await req.json();
    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 },
      );
    }

    await fetch(`${API_BASE}/updatefeedback/${userIdText}/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fb_id,
        fb_status: "Без исполнителя",
      }),
      cache: "no-store",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Ошибка сброса задания Zoon",
      },
      { status: 500 },
    );
  }
}
