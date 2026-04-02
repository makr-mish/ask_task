import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const { userIdText, fb_id, default_id } = await req.json();
    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 },
      );
    }

    const data = await postJson(`${API_BASE}/deal/question/answer/${userIdText}/${token}`, {
      fb_id,
      default_id,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка получения контрольного вопроса Zoon",
      },
      { status: 500 },
    );
  }
}
