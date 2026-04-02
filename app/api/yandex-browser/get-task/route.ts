import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id, id_yandex_browser } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан в .env.local" },
        { status: 500 }
      );
    }

    const reviewId = fb_id || id_yandex_browser;

    if (!reviewId) {
      return NextResponse.json(
        { ok: false, error: "Не передан ID отзыва" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${API_BASE}/getfeedback/${userIdText}/${token}/${reviewId}`,
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
        { ok: false, error: "Некорректный ответ сервера" },
        { status: 500 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.error || data?.message || "Ошибка получения задания",
        },
        { status: res.status }
      );
    }

    const taskText =
      data?.link_post ??
      data?.data?.link_post ??
      data?.name_profile ??
      data?.company_address ??
      data?.data?.name_profile ??
      data?.data?.company_address ??
      "";

    return NextResponse.json({
      ok: true,
      answer: String(taskText || ""),
      link_post: String(data?.link_post ?? data?.data?.link_post ?? ""),
      raw: data,
    });
  } catch (error) {
    console.error("yandex-browser get-task error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ошибка получения задания",
      },
      { status: 500 }
    );
  }
}