import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/yandex-api";

function getZoonErrorMessage(resultCode: unknown) {
  const code = Number(resultCode);

  if (code === 404) {
    return "Свободных заданий Zoon сейчас нет. Попробуйте позже.";
  }

  if (code === 103) {
    return "По этому аккаунту сейчас нельзя взять задание Zoon. Попробуйте другой аккаунт или позже.";
  }

  if (code === 104) {
    return "Для этого аккаунта задание Zoon сейчас недоступно. Проверьте данные аккаунта и попробуйте позже.";
  }

  if (code === 405) {
    return "Сейчас взять задание Zoon нельзя. Возможно, для этого аккаунта действует ограничение.";
  }

  return "Ошибка при получении задания Zoon";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userIdText = String(body.userIdText || "").trim();
    const gender = String(body.gender || "").trim();
    const telegram_id = String(body.telegram_id || userIdText || "").trim();
    const telegram_username = String(body.telegram_username || "").trim();
    const account_name = String(body.account_name || "").trim();
    const amount = String(body.amount || "").trim();

    const token = process.env.RATING_SMART_TOKEN;

    if (!userIdText) {
      return NextResponse.json(
        { ok: false, error: "Не передан userIdText" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "RATING_SMART_TOKEN не задан в .env.local" },
        { status: 500 }
      );
    }

    const normalizedGender =
      gender === "Мужской" || gender === "Женский" || gender === "Любой"
        ? gender
        : "Любой";

    const payload = {
      gender_acc: ["Любой", normalizedGender],
      telegram_id,
      telegram_username,
      account_name,
      amount,
    };

    const url = `${API_BASE}/zoon/getfreefeedback/${encodeURIComponent(
      userIdText
    )}/${encodeURIComponent(token)}`;

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
          error: `Некорректный ответ от внешнего API: ${text}`,
        },
        { status: 500 }
      );
    }

    const result = data?.result;

    // Спец-коды внешнего API
    if (
      result === 404 ||
      result === 103 ||
      result === 104 ||
      result === 405
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: getZoonErrorMessage(result),
          code: result,
          data,
        },
        { status: 400 }
      );
    }

    if (!externalRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.message ||
            data?.error ||
            "Ошибка при получении задания Zoon",
          data,
        },
        { status: externalRes.status || 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        {
          ok: false,
          error: "В ответе нет result",
          data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      feedbackId: String(result),
      fbId: String(result),
      siteId: String(result),
      raw: data,
    });
  } catch (error) {
    console.error("ZOON GET FEEDBACK ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Внутренняя ошибка сервера",
      },
      { status: 500 }
    ); 
  }
}