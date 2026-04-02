import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    answer: "Откройте сайт Yell и выполните задание",
  });
}