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
  try {
    const { login, password } = await req.json();

    console.log("LOGIN TRY:", login);

    if (!login || !password) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    try {
      const [rows]: any = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [login]
      );

      console.log("DB RESULT:", rows);

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
    } catch (dbError: any) {
      console.error("DB ERROR:", dbError);

      // fallback
      if (
        login === process.env.FALLBACK_LOGIN &&
        password === process.env.FALLBACK_PASSWORD
      ) {
        return NextResponse.json({
          success: true,
          userId: Number(process.env.FALLBACK_USER_ID),
          fallback: true,
        });
      }

      return NextResponse.json(
        {
          error: "База недоступна и fallback не подошёл",
          details: dbError?.message,
        },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error("LOGIN ERROR:", e);

    return NextResponse.json(
      {
        error: "Ошибка сервера",
        details: e?.message,
      },
      { status: 500 }
    );
  }
}