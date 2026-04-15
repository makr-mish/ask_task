import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, id_yandex_site, fb_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    const reviewId = fb_id || id_yandex_site;

    if (!reviewId) {
      return NextResponse.json(
        { ok: false, error: "Не передан ID отзыва" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${API_BASE}/getfeedback/${userIdText}/${token}/${reviewId}`,
      { method: "GET", cache: "no-store" }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Ошибка получения текста", raw: data },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      fb_text: String(data?.fb_text ?? data?.data?.fb_text ?? ""),
      raw: data,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Ошибка получения текста отзыва" },
      { status: 500 }
    );
  }
}