"use client";

import { ReactNode } from "react";

type InfoBlockProps = {
  heading: string;
  intro?: ReactNode;
  body?: ReactNode;
  actionTitle1: string;
  actionText1: string;
  actionTitle2: string;
  actionText2: string;
};

export default function InfoBlock({
  heading,
  intro,
  body,
  actionTitle1,
  actionText1,
  actionTitle2,
  actionText2,
}: InfoBlockProps) {
  return (
    <div className="mt-5 rounded-2xl bg-white p-4 sm:p-5">
      <h3 className="text-xl font-semibold text-black">{heading}</h3>

      {intro && (
        <div className="mt-3 text-sm leading-7 text-gray-700 sm:text-base">
          {intro}
        </div>
      )}

      {body && (
        <div className="mt-3 text-sm leading-7 text-gray-700 sm:text-base">
          {body}
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-[#f7f8fb] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">
          {actionTitle1}
        </p>
        <p className="mt-2 text-sm font-medium text-black sm:text-base">
          {actionText1}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-[#f7f8fb] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">
          {actionTitle2}
        </p>
        <p className="mt-2 text-sm font-medium text-black sm:text-base">
          {actionText2}
        </p>
      </div>
    </div>
  );
}