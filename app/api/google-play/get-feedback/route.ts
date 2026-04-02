import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(
    `https://lk.rating-smart.ru:8080/api/bot/getfeedback/${body.userIdText}/${body.token}/google_play`,
  );

  const data = await res.json();

  return NextResponse.json(data);
}