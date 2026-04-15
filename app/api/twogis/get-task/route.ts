import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан в .env.local" },
        { status: 500 },
      );
    }

    if (!userIdText || !fb_id) {
      return NextResponse.json(
        { ok: false, error: "Не передан userIdText или fb_id" },
        { status: 400 },
      );
    }

    const res = await fetch(
      `${API_BASE}/getfeedback/${userIdText}/${token}/${fb_id}`,
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
        {
          ok: false,
          error: `Некорректный JSON от внешнего API: ${text}`,
        },
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

    const taskText = String(
      data?.link_post ??
        data?.data?.link_post ??
        data?.result?.link_post ??
        data?.data?.result?.link_post ??
        data?.name_profile ??
        data?.data?.name_profile ??
        data?.company_address ??
        data?.data?.company_address ??
        "",
    ).trim();

    const linkPost = String(
      data?.link_post ??
        data?.data?.link_post ??
        data?.result?.link_post ??
        data?.data?.result?.link_post ??
        "",
    ).trim();

    if (!taskText) {
      return NextResponse.json(
        {
          ok: false,
          error: "В ответе API не найдено содержимое задания",
          raw: data,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      answer: taskText,
      link_post: linkPost,
      raw: data,
    });
  } catch (error) {
    console.error("twogis get-task error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Ошибка получения задания",
      },
      { status: 500 },
    );
  }
}