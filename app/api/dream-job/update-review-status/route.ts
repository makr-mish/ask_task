import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id, fb_status } = body;

    const res = await fetch(`${API_BASE}/updatestatusfeedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userIdText,
        fb_id,
        fb_status,
      }),
      cache: "no-store",
    });

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
      result: data?.result ?? data?.data?.result ?? fb_id,
      raw: data,
    });
  } catch (error) {
    console.error("dream-job update-review-status error:", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка отправки на модерацию" },
      { status: 500 },
    );
  }
}