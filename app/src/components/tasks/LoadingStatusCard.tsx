"use client";

type LoadingStatusCardProps = {
  text: string;
  subtext?: string;
};

export default function LoadingStatusCard({
  text,
  subtext,
}: LoadingStatusCardProps) {
  return (
    <div className="mt-6 rounded-2xl bg-[#f5f9f6] p-4 sm:p-6">
      {text && (
        <p className="text-base font-medium text-gray-800 sm:text-lg">
          {text}
        </p>
      )}

      <div className={`${text ? "mt-4" : ""} flex items-center gap-3`}>
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
        <span className="text-sm text-gray-600 sm:text-base">
          {subtext || "Загрузка..."}
        </span>
      </div>
    </div>
  );
}