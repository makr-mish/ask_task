import { NextRequest, NextResponse } from "next/server";
import { API_BASE, postJson } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userIdText, fb_id, id_yandex_site, status, fb_status } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан" },
        { status: 500 }
      );
    }

    const reviewId = String(fb_id || id_yandex_site || "").trim();
    const finalStatus = String(status || fb_status || "Выполнен").trim();

    if (!userIdText || !reviewId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Не передан userIdText или ID отзыва",
          debug: { userIdText, fb_id, id_yandex_site },
        },
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

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("twogis update-review-status error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка обновления статуса отзыва",
      },
      { status: 500 }
    );
  }
}