import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "RATING_SMART_TOKEN не задан",
        },
        { status: 500 }
      );
    }

    const url = `${API_BASE}/updatefeedback/${userIdText}/${token}`;

    console.log("=== RESET TASK REQUEST ===");
    console.log("url:", url);
    console.log("fb_id:", fb_id);

    const data: any = await postJson(url, {
      fb_id,
      fb_status: "Без исполнителя",
    });

    console.log("=== RESET TASK RESPONSE ===");
    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (error) {
    console.error("reset-task error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Ошибка сброса задания",
      },
      { status: 500 }
    );
  }
}