"use client";

import Link from "next/link";

type PersonalDataConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

export default function PersonalDataConsent({
  checked,
  onChange,
  className = "",
}: PersonalDataConsentProps) {
  return (
    <label
      className={`flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left text-[13px] leading-5 text-slate-600 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-slate-900"
      />
      <span>
        Я даю согласие на обработку персональных данных и принимаю{" "}
        <Link
          href="/privacy"
          target="_blank"
          className="font-semibold text-slate-900 underline underline-offset-2"
        >
          Политику обработки персональных данных
        </Link>{" "}
        и{" "}
        <Link
          href="/personal-data-consent"
          target="_blank"
          className="font-semibold text-slate-900 underline underline-offset-2"
        >
          Согласие на обработку персональных данных
        </Link>
        .
      </span>
    </label>
  );
}
