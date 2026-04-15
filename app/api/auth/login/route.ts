export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mysql from "mysql2";

const bcrypt = require("bcryptjs");

const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  })
  .promise();

export async function POST(req: Request) {
  const FALLBACK_LOGIN = process.env.FALLBACK_LOGIN;
  const FALLBACK_PASSWORD = process.env.FALLBACK_PASSWORD;
  const FALLBACK_USER_ID = Number(process.env.FALLBACK_USER_ID || -1);

  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    try {
      // 🔹 Пытаемся через БД
      const [rows]: any = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [login]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Пользователь не найден" },
          { status: 400 }
        );
      }

      const user = rows[0];
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return NextResponse.json(
          { error: "Неверный пароль" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        userId: user.id,
      });

    } catch (dbError) {
      console.error("DB ERROR → используем fallback:", dbError);

      // 🔥 fallback логин
      if (login === FALLBACK_LOGIN && password === FALLBACK_PASSWORD) {
        return NextResponse.json({
          success: true,
          userId: FALLBACK_USER_ID,
          fallback: true,
        });
      }

      return NextResponse.json(
        { error: "База недоступна и fallback не подошёл" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}