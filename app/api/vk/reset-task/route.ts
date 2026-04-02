import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 },
      );
    }

    const data: any = await postJson(
      `${API_BASE}/updatefeedback/${userIdText}/${token}`,
      {
        fb_id,
        fb_status: "Без исполнителя",
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("vk reset-task error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ошибка сброса задания",
      },
      { status: 500 },
    );
  }
}
