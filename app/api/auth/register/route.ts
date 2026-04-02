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

    if (!login || !password) {
      return NextResponse.json(
        { error: "Логин и пароль обязательны" },
        { status: 400 }
      );
    }

    const [existing]: any = await pool.query(
      "SELECT * FROM users WHERE login = ?",
      [login]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Пользователь уже существует" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
      "INSERT INTO users (login, password) VALUES (?, ?)",
      [login, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      userId: result.insertId,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}