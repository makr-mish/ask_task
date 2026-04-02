"use client";

type ExampleCardProps = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  caption: string;
  onOpenPreview: () => void;
};

export default function ExampleCard({
  title,
  imageSrc,
  imageAlt,
  caption,
  onOpenPreview,
}: ExampleCardProps) {
  return (
    <div className="mt-5 rounded-2xl bg-white p-4 sm:p-5">
      <h2 className="text-xl font-semibold text-black sm:text-2xl">{title}</h2>

      <div className="mt-4 flex flex-col items-start gap-4 sm:mt-5">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-h-[240px] w-auto rounded-2xl border border-gray-200 object-contain sm:max-h-[340px]"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={onOpenPreview}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Посмотреть пример
          </button>

          <p className="text-sm text-gray-500">{caption}</p>
        </div>
      </div>
    </div>
  );
}