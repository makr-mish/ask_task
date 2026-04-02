import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      userIdText,
      gender,
      telegram_id,
      telegram_username,
      account_name,
      amount,
      region,
    } = body;

    const token = process.env.RATING_SMART_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          error: "RATING_SMART_TOKEN не задан в .env.local",
        },
        { status: 500 },
      );
    }

    const normalizedGender =
      gender === "Любой" || gender === "Мужской" || gender === "Женский"
        ? gender
        : "Любой";

    const payload = {
      gender_acc: ["Любой", normalizedGender],
      telegram_id: String(telegram_id || userIdText || ""),
      telegram_username: String(telegram_username || ""),
      account_name: String(account_name || ""),
      amount: String(amount || ""),
      region: String(region || ""),
    };

    const url = `${API_BASE}/dream_job/getfreefeedback/${userIdText}/${token}`;

    const externalRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await externalRes.text();

    let data: any = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: `Некорректный JSON от внешнего API: ${text}`,
        },
        { status: 500 },
      );
    }

    const resultValue =
      data?.result ??
      data?.data?.result ??
      data?.fb_id ??
      data?.data?.fb_id ??
      "";

    if (!externalRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.message ||
            data?.error ||
            `Ошибка внешнего API: ${externalRes.status}`,
          data,
        },
        { status: externalRes.status || 500 },
      );
    }

    if (!resultValue) {
      return NextResponse.json(
        {
          ok: false,
          error: "Не удалось получить ID отзыва",
          data,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        result: String(resultValue),
        fb_id: String(data?.fb_id ?? data?.data?.fb_id ?? resultValue),
        id_yandex_site: String(
          data?.id_yandex_site ??
            data?.data?.id_yandex_site ??
            data?.fb_id ??
            data?.data?.fb_id ??
            resultValue,
        ),
      },
      raw: data,
    });
  } catch (error) {
    console.error("dream-job get-feedback error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Ошибка получения ID отзыва",
      },
      { status: 500 },
    );
  }
}