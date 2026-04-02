import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, id_yandex_site } = body;

    const res = await fetch(
      `${API_BASE}/getreview/${userIdText}/${id_yandex_site}`,
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
        { ok: false, error: `Некорректный JSON от внешнего API: ${text}` },
        { status: 500 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.message ||
            data?.error ||
            `Ошибка внешнего API: ${res.status}`,
          raw: data,
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
    console.error("dream-job get-review-text error:", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка получения текста отзыва" },
      { status: 500 },
    );
  }
}