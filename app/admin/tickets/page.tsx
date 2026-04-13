import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  getAdminCookieName,
  verifyAdminSessionValue,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

type TicketRow = {
  id: number;
  user_id: string;
  subject: string;
  message: string;
  created_at: string | Date;
};

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("ru-RU");
}

export default async function AdminTicketsPage() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSessionValue(sessionValue)) {
    redirect("/admin-login");
  }

  const [rows] = await db.query(
    `
    SELECT id, user_id, subject, message, created_at
    FROM support_tickets
    ORDER BY created_at DESC
    LIMIT 200
    `,
  );

  const tickets = rows as TicketRow[];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Тикеты поддержки
            </h1>
            <p className="mt-1 text-slate-500">
              Вопросы, жалобы и пожелания от исполнителей
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/admin"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Назад в админку
            </a>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 text-sm text-slate-500">
            Всего обращений: {tickets.length}
          </div>

          {tickets.length === 0 ? (
            <div className="text-sm text-slate-500">
              Пока нет обращений от исполнителей
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-lg font-bold text-slate-900">
                      {ticket.subject}
                    </div>
                    <div className="text-sm text-slate-500">
                      {formatDateTime(ticket.created_at)}
                    </div>
                  </div>

                  <div className="mb-3 text-sm text-slate-500">
                    Пользователь ID:{" "}
                    <span className="font-semibold text-slate-700">
                      {ticket.user_id}
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-800">
                    {ticket.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}