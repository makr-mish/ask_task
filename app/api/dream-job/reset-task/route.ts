import { NextRequest, NextResponse } from "next/server";

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

    const res = await fetch(
      `https://lk.rating-smart.ru:8080/api/bot/resettask/${userIdText}/${token}/dream_job`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fb_id }),
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("dream-job reset-task error:", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка сброса задания" },
      { status: 500 },
    );
  }
}