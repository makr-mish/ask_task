"use client";

import { ReactNode } from "react";
import { PlatformConfig } from "@/lib/platforms";

type PlatformTaskShellProps = {
  platform: PlatformConfig;
  children: ReactNode;
};

export default function PlatformTaskShell({
  platform,
  children,
}: PlatformTaskShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Платформа</p>
              <h1 className="mt-1 text-3xl font-bold text-black">
                {platform.label}
              </h1>
            </div>

            <div className="rounded-full bg-[#f3f5f9] px-4 py-2 text-sm font-semibold text-[#102a43]">
              {platform.price}₽
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}