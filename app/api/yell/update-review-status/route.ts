import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userIdText, fb_id, id_yandex_site, status, fb_status } = body;

    const token = process.env.RATING_SMART_TOKEN;

    const reviewId = String(fb_id || id_yandex_site || "");
    const finalStatus = status || fb_status || "Выполнен";

    if (!reviewId) {
      return NextResponse.json(
        { ok: false, error: "Нет ID отзыва" },
        { status: 400 }
      );
    }

    const data: any = await postJson(
      `${API_BASE}/updatefeedback/${userIdText}/${token}`,
      {
        fb_id: reviewId,
        fb_status: finalStatus,
      }
    );

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Ошибка завершения задания" },
      { status: 500 }
    );
  }
}