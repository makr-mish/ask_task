import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    const data: any = await postJson(
      `${API_BASE}/updatefeedback/${userIdText}/${token}`,
      {
        fb_id,
        fb_status: "Без исполнителя",
      }
    );

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Ошибка сброса задания" },
      { status: 500 }
    );
  }
}