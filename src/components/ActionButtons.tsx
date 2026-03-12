"use client";

interface ActionButtonsProps {
  sort: 1 | 2;
  onSortChange: (sort: 1 | 2) => void;
}

export function ActionButtons({ sort, onSortChange }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 mb-8" data-purpose="sorting-controls">
      <button
        type="button"
        onClick={() => onSortChange(1)}
        className={`flex-1 font-extrabold text-base py-8 rounded-custom flex flex-col items-center justify-center transition-transform active:scale-95 ${
          sort === 1
            ? "bg-primary text-dark shadow-lg shadow-primary/20"
            : "bg-zinc-800 text-white border border-zinc-700"
        }`}
      >
        <span className="text-base uppercase tracking-widest opacity-70 mb-1">
          CHEAPEST
        </span>
        최저가순
      </button>
      <button
        type="button"
        onClick={() => onSortChange(2)}
        className={`flex-1 font-extrabold text-base py-8 rounded-custom flex flex-col items-center justify-center transition-transform active:scale-95 ${
          sort === 2
            ? "bg-primary text-dark shadow-lg shadow-primary/20"
            : "bg-zinc-800 text-white border border-zinc-700"
        }`}
      >
        <span className="text-base uppercase tracking-widest opacity-50 mb-1">
          CLOSEST
        </span>
        거리순
      </button>
    </div>
  );
}
