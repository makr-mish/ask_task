import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://lk.rating-smart.ru:8080";
const TOKEN = process.env.RATING_SMART_TOKEN || "";

type RequestBody =
  | {
      action: "getDefaultDetails";
      userId: string;
    }
  | {
      action: "saveDetails";
      userId: string;
      payload: {
        type: "sbp";
        phone_number: string;
        sbp_bank: string;
        first_name: string;
        last_name: string;
      };
    }
  | {
      action: "createWithdraw";
      userId: string;
      payload: {
        amount: number;
        status: "pending";
        type: "withdraw";
        telegram_id: string;
        detail_id: string | number;
      };
    };

function isNumberValue(value: unknown) {
  if (typeof value === "number") return true;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message: "Не найден токен API. Добавьте RATING_SMART_TOKEN в .env.local",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as RequestBody;

    if (!body?.action || !body?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Не хватает данных для запроса",
        },
        { status: 400 },
      );
    }

    if (body.action === "getDefaultDetails") {
      const response = await fetch(
        `${API_BASE}/api/bot/defaultdetail/${body.userId}/${TOKEN}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();
      const message = data?.message;

      if (message === "No details found") {
        return NextResponse.json({
          success: true,
          hasDetails: false,
        });
      }

      return NextResponse.json({
        success: true,
        hasDetails: true,
        detailsText: message,
        detailId: data?.value,
      });
    }

    if (body.action === "saveDetails") {
      const { phone_number, sbp_bank, first_name, last_name } = body.payload;

      if (!/^8\d{10}$/.test(phone_number)) {
        return NextResponse.json(
          {
            success: false,
            message: "Телефон должен быть в формате 89999239429",
          },
          { status: 400 },
        );
      }

      if (!sbp_bank || !first_name.trim() || !last_name.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Заполните все реквизиты",
          },
          { status: 400 },
        );
      }

      const response = await fetch(
        `${API_BASE}/api/bot/detail/${body.userId}/${TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body.payload),
        },
      );

      const data = await response.json();
      const message = data?.message;

      if (message === "Error") {
        return NextResponse.json(
          {
            success: false,
            message: "Что-то добавлено неверно. Заполните реквизиты заново.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        message: message || "Реквизиты сохранены",
      });
    }

    if (body.action === "createWithdraw") {
      const { amount, detail_id } = body.payload;

      if (!Number.isFinite(amount) || amount < 200) {
        return NextResponse.json(
          {
            success: false,
            message: "Минимальная сумма вывода — 200 руб.",
          },
          { status: 400 },
        );
      }

      if (!detail_id) {
        return NextResponse.json(
          {
            success: false,
            message: "Не найдены реквизиты для вывода",
          },
          { status: 400 },
        );
      }

      const response = await fetch(
        `${API_BASE}/api/bot/transaction/${body.userId}/${TOKEN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body.payload),
        },
      );

      const data = await response.json();
      const message = data?.message;

      if (isNumberValue(message)) {
        return NextResponse.json({
          success: true,
          status: "success",
          requestNumber: message,
        });
      }

      if (message === "No details found") {
        return NextResponse.json({
          success: true,
          status: "no_details",
        });
      }

      if (message === "Not enough balance") {
        return NextResponse.json({
          success: true,
          status: "not_enough_balance",
        });
      }

      return NextResponse.json(
        {
          success: false,
          status: "other_error",
          message: message || "Неизвестная ошибка",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Неизвестное действие",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Withdraw API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Внутренняя ошибка сервера",
      },
      { status: 500 },
    );
  }
}