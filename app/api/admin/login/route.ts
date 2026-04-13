import { NextResponse } from "next/server";
import {
  createAdminSessionValue,
  getAdminCookieName,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const login = String(body?.login || "").trim();
    const password = String(body?.password || "").trim();

    const envLogin = process.env.ADMIN_LOGIN || "";
    const envPassword = process.env.ADMIN_PASSWORD || "";

    if (!login || !password) {
      return NextResponse.json(
        { error: "Введите логин и пароль" },
        { status: 400 },
      );
    }

    if (login !== envLogin || password !== envPassword) {
      return NextResponse.json(
        { error: "Неверный логин или пароль" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set({
      name: getAdminCookieName(),
      value: createAdminSessionValue(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: "Ошибка авторизации" },
      { status: 500 },
    );
  }
}