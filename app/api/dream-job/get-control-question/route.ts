import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id, default_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 },
      );
    }

    const data = await postJson(
      `${API_BASE}/getquestion/${userIdText}/${fb_id}/${default_id}`,
      {},
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("dream-job get-control-question error:", error);

    return NextResponse.json(
      { ok: false, error: "Ошибка получения контрольного вопроса" },
      { status: 500 },
    );
  }
}