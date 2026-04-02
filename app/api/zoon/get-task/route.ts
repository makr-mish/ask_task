import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    answer: "Откройте карточку компании на Zoon и выполните задание",
  });
}
