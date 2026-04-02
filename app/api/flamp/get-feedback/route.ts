import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdText, telegram_id, telegram_username, account_name, amount } = body;

    const token = process.env.RATING_SMART_TOKEN;

    const res = await fetch(
      `${API_BASE}/flamp/getfreefeedback/${userIdText}/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_id,
          telegram_username,
          account_name,
          amount,
        }),
      }
    );

    const data = await res.json();

    return NextResponse.json({
      ok: true,
      data: {
        result: data?.result,
        fb_id: data?.result,
        id_yandex_site: data?.result,
      },
      raw: data,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Ошибка получения задания" });
  }
}