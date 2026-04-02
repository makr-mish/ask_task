import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://lk.rating-smart.ru:8080/api/bot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_check_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "RATING_SMART_TOKEN не задан в .env.local",
        },
        { status: 500 }
      );
    }

    const res = await fetch(
      `${API_BASE}/getfeedback/${userIdText}/${token}/${fb_check_id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const text = await res.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Некорректный ответ сервера",
        },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || data?.message || "Ошибка проверки отзыва",
        },
        { status: res.status }
      );
    }

    if (data?.error) {
      return NextResponse.json({
        ok: false,
        error: data.error,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        fb_status: data?.fb_status || "—",
        status_date: data?.status_date || "—",
      },
    });
  } catch (error) {
    console.error("check-review error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Ошибка проверки отзыва",
      },
      { status: 500 }
    );
  }
}