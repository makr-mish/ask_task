import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, fb_id, default_id } = body;

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

    if (!userIdText || !fb_id || !default_id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Не хватает userIdText, fb_id или default_id",
        },
        { status: 400 }
      );
    }

    const url = `${API_BASE}/deal/question/answer/${userIdText}/${token}`;

    console.log("=== CONTROL QUESTION REQUEST ===");
    console.log("userIdText:", userIdText);
    console.log("fb_id:", fb_id);
    console.log("default_id:", default_id);

    const data: any = await postJson(url, {
      fb_id,
      default_id,
    });

    console.log("=== CONTROL QUESTION RESPONSE ===");
    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("get-control-question error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка получения контрольного вопроса",
      },
      { status: 500 }
    );
  }
}
