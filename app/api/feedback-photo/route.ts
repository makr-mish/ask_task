import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const userId = searchParams.get("userId") || "";
    const reviewId = searchParams.get("reviewId") || "";

    const token =
      process.env.RATING_SMART_TOKEN ||
      process.env.API_TOKEN ||
      process.env.NEXT_PUBLIC_API_TOKEN ||
      "";

    if (!userId || !reviewId) {
      return NextResponse.json(
        { error: "Не хватает параметров" },
        { status: 400 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "Токен не найден в .env.local" },
        { status: 500 },
      );
    }

    const url = `https://lk.rating-smart.ru:8080/api/bot/getfeedback/${userId}/${token}/${reviewId}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const rawText = await response.text();

    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Ошибка получения данных",
          status: response.status,
          raw: data,
        },
        { status: response.status },
      );
    }

    const photo = String(
      data?.photo ?? data?.data?.photo ?? data?.result?.photo ?? "",
    ).trim();

    const fb_note = String(
      data?.fb_note ?? data?.data?.fb_note ?? data?.result?.fb_note ?? "",
    ).trim();

    return NextResponse.json({
      photo,
      fb_note,
    });
  } catch (error) {
    console.error("feedback-photo route error:", error);

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}