import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const { userIdText, id_yandex_site } = await req.json();
    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 },
      );
    }

    const res = await fetch(
      `${API_BASE}/getfeedback/${userIdText}/${token}/${id_yandex_site}`,
      { cache: "no-store" },
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.message || data?.error || "Ошибка получения текста отзыва Zoon",
          raw: data,
        },
        { status: res.status || 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      fb_text: data?.fb_text ?? "",
      raw: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Ошибка получения текста отзыва Zoon",
      },
      { status: 500 },
    );
  }
}
