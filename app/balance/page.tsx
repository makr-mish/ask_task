"use client";

import { useEffect, useMemo, useState } from "react";

type TgUser = {
  USER_ID_TEXT: string;
  first_name?: string;
  username?: string;
};

type AppUser = {
  USER_ID_TEXT: string;
  first_name?: string;
  username?: string;
};

type Step =
  | "loading"
  | "detailsReady"
  | "noDetails"
  | "confirm"
  | "success"
  | "error";

type BankOption = {
  label: string;
  value: string;
};

const BANKS: BankOption[] = [
  { label: "ТБанк", value: "100000000004" },
  { label: "Сбербанк", value: "100000000111" },
  { label: "Альфа Банк", value: "100000000008" },
  { label: "OZON Банк", value: "100000000273" },
  { label: "ВТБ Банк", value: "100000000005" },
  { label: "РНКБ Банк", value: "100000000011" },
  { label: "Газпромбанк", value: "100000000001" },
];

type DefaultDetailsResponse = {
  success: boolean;
  hasDetails?: boolean;
  detailsText?: unknown;
  detailId?: string | number;
  message?: string;
};

type SaveDetailsResponse = {
  success: boolean;
  message?: string;
};

type WithdrawResponse = {
  success: boolean;
  status?: "success" | "no_details" | "not_enough_balance" | "other_error";
  requestNumber?: string | number;
  message?: string;
};

export default function BalancePage() {
  const [user, setUser] = useState<AppUser | null>(null);

  const [step, setStep] = useState<Step>("loading");
  const [loading, setLoading] = useState(false);

  const [detailsText, setDetailsText] = useState<unknown>("");
  const [detailId, setDetailId] = useState<string | number | null>(null);

  const [amount, setAmount] = useState("");

  const [bankId, setBankId] = useState(BANKS[0].value);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [errorText, setErrorText] = useState("");
  const [requestNumber, setRequestNumber] = useState<string | number | null>(null);

  useEffect(() => {
    const rawTgUser = localStorage.getItem("tg_user");
    const userId = localStorage.getItem("user_id");

    if (rawTgUser) {
      try {
        const parsed: TgUser = JSON.parse(rawTgUser);

        setUser({
          USER_ID_TEXT: String(parsed.USER_ID_TEXT),
          first_name: parsed.first_name || "Telegram user",
          username: parsed.username || "",
        });

        return;
      } catch {
        localStorage.removeItem("tg_user");
      }
    }

    if (userId) {
      setUser({
        USER_ID_TEXT: String(userId),
        first_name: "Пользователь",
        username: "",
      });
      return;
    }

    window.location.href = "/login";
  }, []);

  const parsedAmount = useMemo(() => Number(amount), [amount]);

  const safeDetailsText =
    typeof detailsText === "string"
      ? detailsText
      : detailsText && typeof detailsText === "object"
        ? "У вас нет привязанных реквизитов"
        : String(detailsText ?? "");

  const hasRealDetails =
    safeDetailsText.trim().length > 0 &&
    safeDetailsText !== "У вас нет привязанных реквизитов";

  const isPhoneValid = /^8\d{10}$/.test(phoneNumber.trim());
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount >= 200;

  const canSaveDetails =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    bankId.trim().length > 0 &&
    isPhoneValid;

  const canGoToConfirm =
    hasRealDetails &&
    detailId !== null &&
    isAmountValid;

  async function loadDefaultDetails(currentUserId: string) {
    try {
      setLoading(true);
      setErrorText("");
      setStep("loading");

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getDefaultDetails",
          userId: currentUserId,
        }),
      });

      const data: DefaultDetailsResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorText(data.message || "Не удалось загрузить реквизиты");
        setStep("error");
        return;
      }

      if (!data.hasDetails) {
        setDetailsText("");
        setDetailId(null);
        setStep("noDetails");
        return;
      }

      if (data.detailsText && typeof data.detailsText === "object") {
        setDetailsText("У вас нет привязанных реквизитов");
        setDetailId(null);
        setStep("noDetails");
        return;
      }

      setDetailsText(String(data.detailsText ?? ""));
      setDetailId(data.detailId ?? null);
      setStep("detailsReady");
    } catch (error) {
      setErrorText("Не удалось загрузить реквизиты");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDetails() {
    if (!user || !canSaveDetails) return;

    try {
      setLoading(true);
      setErrorText("");

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "saveDetails",
          userId: user.USER_ID_TEXT,
          payload: {
            type: "sbp",
            phone_number: phoneNumber.trim(),
            sbp_bank: bankId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        }),
      });

      const data: SaveDetailsResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorText(
          data.message || "Что-то добавлено неверно. Заполните реквизиты заново.",
        );
        setStep("error");
        return;
      }

      setFirstName("");
      setLastName("");
      setPhoneNumber("");

      await loadDefaultDetails(user.USER_ID_TEXT);
    } catch (error) {
      setErrorText("Не удалось сохранить реквизиты");
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWithdraw() {
    if (!user || !canGoToConfirm || detailId === null) return;

    try {
      setLoading(true);
      setErrorText("");

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "createWithdraw",
          userId: user.USER_ID_TEXT,
          payload: {
            amount: parsedAmount,
            status: "pending",
            type: "withdraw",
            telegram_id: user.USER_ID_TEXT,
            detail_id: detailId,
          },
        }),
      });

      const data: WithdrawResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorText(
          data.message ||
            "Если у вас вышла это ошибка, перешлите сообщение менеджеру @mikhail_managers\n\nСпасибо!",
        );
        setStep("error");
        return;
      }

      if (data.status === "success") {
        setRequestNumber(data.requestNumber || null);
        setStep("success");
        return;
      }

      if (data.status === "no_details") {
        setErrorText("Вы указали неверные реквизиты, измените в личном кабинете");
        setStep("error");
        return;
      }

      if (data.status === "not_enough_balance") {
        setErrorText("У вас недостаточно денег на балансе. Укажите другую сумму");
        setStep("error");
        return;
      }

      setErrorText(
        "Если у вас вышла это ошибка, перешлите сообщение менеджеру @mikhail_managers\n\nСпасибо!",
      );
      setStep("error");
    } catch (error) {
      setErrorText(
        "Если у вас вышла это ошибка, перешлите сообщение менеджеру @mikhail_managers\n\nСпасибо!",
      );
      setStep("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    loadDefaultDetails(user.USER_ID_TEXT);
  }, [user]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f8] px-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">Загрузка...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#6b7280]">Личный кабинет</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
                Вывод средств
              </h1>
              <p className="mt-2 text-sm text-[#6b7280]">
                Пользователь: {user.first_name || "—"} · ID: {user.USER_ID_TEXT}
              </p>
            </div>

            <button
              type="button"
              onClick={() => (window.location.href = "/dashboard")}
              className="rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
            >
              Назад
            </button>
          </div>

          {step === "loading" && (
            <div className="rounded-2xl bg-[#f8fafc] p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#dbeafe] border-t-[#2563eb]" />
              <p className="text-base font-semibold text-[#111827]">Загружаем реквизиты...</p>
            </div>
          )}

          {step === "detailsReady" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-[#f8fafc] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">Реквизиты по умолчанию</p>
                    <p className="mt-2 text-base font-semibold text-[#111827]">
                      {safeDetailsText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("noDetails")}
                    className="rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                  >
                    Привязать / изменить реквизиты
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-[#f8fafc] p-5">
                <label className="mb-2 block text-sm font-medium text-[#111827]">
                  Сумма вывода
                </label>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Введите сумму от 200"
                  className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base outline-none transition focus:border-[#2563eb]"
                />
                <p className="mt-2 text-sm text-[#6b7280]">Минимальная сумма: 200 руб.</p>

                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  disabled={!canGoToConfirm || loading}
                  className="mt-4 w-full rounded-2xl bg-[#111827] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                >
                  Продолжить
                </button>
              </div>
            </div>
          )}

          {step === "noDetails" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-5">
                <p className="text-base font-semibold text-[#92400e]">
                  Привязка реквизитов для вывода
                </p>
                <p className="mt-2 text-sm text-[#92400e]">
                  Вывод возможен только по СБП.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Банк</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base outline-none transition focus:border-[#2563eb]"
                  >
                    {BANKS.map((bank) => (
                      <option key={bank.value} value={bank.value}>
                        {bank.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Имя</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Иван"
                    className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base outline-none transition focus:border-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">Фамилия</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Иванов"
                    className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base outline-none transition focus:border-[#2563eb]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#111827]">
                    Телефон
                  </label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="89999239429"
                    className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base outline-none transition focus:border-[#2563eb]"
                  />
                  <p className="mt-2 text-sm text-[#6b7280]">Формат строго: 89999239429</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    if (hasRealDetails && detailId !== null) {
                      setStep("detailsReady");
                    } else {
                      window.location.href = "/dashboard";
                    }
                  }}
                  className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                >
                  Назад
                </button>

                <button
                  type="button"
                  onClick={handleSaveDetails}
                  disabled={!canSaveDetails || loading}
                  className="w-full rounded-2xl bg-[#111827] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                >
                  Сохранить реквизиты
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-[#f8fafc] p-5">
                <p className="text-base font-semibold text-[#111827]">
                  Вы подтверждаете вывод {parsedAmount || 0} руб. на реквизиты{" "}
                  {safeDetailsText}
                </p>
              </div>

              <div className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-5">
                <p className="text-sm font-medium leading-6 text-[#1e3a8a]">
                  Внимание! Мы переехали на новую платежную систему, теперь мы платим НДФЛ за
                  каждую выплату. Выплаты также осуществляются каждый день в 8-9 утра по мск.
                  Однако, теперь с каждой заявки взимается комиссия в размере 18%.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep("detailsReady")}
                  className="w-full rounded-2xl border border-[#d1d5db] bg-white px-4 py-3 text-base font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                >
                  Назад
                </button>

                <button
                  type="button"
                  onClick={handleCreateWithdraw}
                  disabled={!canGoToConfirm || loading}
                  className="w-full rounded-2xl bg-[#16a34a] px-4 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#86efac]"
                >
                  Отправить заявку
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#16a34a] text-2xl text-white">
                ✓
              </div>
              <p className="text-xl font-bold text-[#166534]">Ваш вывод отправлен модератору</p>
              <p className="mt-3 text-base text-[#166534]">
                Номер заявки: <span className="font-bold">{requestNumber}</span>
              </p>
              <p className="mt-2 text-sm text-[#166534]">Время зачисления перевода до 24ч</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setAmount("");
                    setRequestNumber(null);
                    setStep("detailsReady");
                  }}
                  className="rounded-2xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Создать ещё одну заявку
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="rounded-2xl border border-[#d1d5db] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                >
                  В главное меню
                </button>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-5">
                <p className="whitespace-pre-line text-base font-medium text-[#991b1b]">
                  {errorText}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => loadDefaultDetails(user.USER_ID_TEXT)}
                  className="rounded-2xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Попробовать снова
                </button>

                <button
                  type="button"
                  onClick={() => setStep("noDetails")}
                  className="rounded-2xl border border-[#d1d5db] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                >
                  Изменить реквизиты
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/dashboard")}
                  className="rounded-2xl border border-[#d1d5db] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                >
                  В главное меню
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}