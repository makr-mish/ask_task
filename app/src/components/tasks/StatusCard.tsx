"use client";

import { ReactNode } from "react";

type StatusCardProps = {
  title?: string;
  text?: string;
  children?: ReactNode;
};

export default function StatusCard({
  title,
  text,
  children,
}: StatusCardProps) {
  return (
    <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
      {title && (
        <h2 className="text-xl font-semibold text-black sm:text-2xl">
          {title}
        </h2>
      )}

      {text && (
        <div className={`${title ? "mt-4" : ""} text-sm leading-7 text-gray-700 sm:text-base`}>
          {text}
        </div>
      )}

      {children}
    </div>
  );
}