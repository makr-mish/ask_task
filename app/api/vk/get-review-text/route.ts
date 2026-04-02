import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, id_yandex_site } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан в .env.local" },
        { status: 500 },
      );
    }

    const res = await fetch(
      `${API_BASE}/getfeedback/${userIdText}/${token}/${id_yandex_site}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const text = await res.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { ok: false, error: "Некорректный ответ сервера" },
        { status: 500 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.error || data?.message || "Ошибка получения текста отзыва",
        },
        { status: res.status },
      );
    }

    return NextResponse.json({
      ok: true,
      fb_text: data?.fb_text ?? data?.data?.fb_text ?? "",
      raw: data,
    });
  } catch (error) {
    console.error("vk get-review-text error:", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка получения текста отзыва" },
      { status: 500 },
    );
  }
}
