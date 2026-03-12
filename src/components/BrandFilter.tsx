"use client";

import { BRAND_MAP } from "./BrandLogo";
import type { Station } from "@/src/types/station";

// 실제 데이터에 존재하는 브랜드만 칩으로 표시하기 위해 stations를 받음
interface BrandFilterProps {
  stations: Station[];
  selected: Set<string>; // 빈 Set = 전체 선택
  onChange: (selected: Set<string>) => void;
}

export function BrandFilter({ stations, selected, onChange }: BrandFilterProps) {
  // 현재 목록에 있는 브랜드 코드 (순서 유지)
  const ORDER = ["SKE", "GSC", "HDO", "SOL", "RTO", "RTX", "NHO", "E1Y", "ETC"];
  const presentBrands = ORDER.filter((code) =>
    stations.some((s) => {
      const key = s.brand in BRAND_MAP ? s.brand : "ETC";
      return key === code;
    })
  );

  const isAll = selected.size === 0;

  const toggle = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    onChange(next);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-3 [&::-webkit-scrollbar]:hidden -mx-5 px-5 mb-4">
      {/* 전체 칩 */}
      <button
        type="button"
        onClick={() => onChange(new Set())}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${
          isAll
            ? "bg-primary text-black border-primary"
            : "bg-zinc-800 text-zinc-400 border-zinc-700"
        }`}
      >
        전체
      </button>

      {presentBrands.map((code) => {
        const info = BRAND_MAP[code];
        const active = selected.has(code);
        return (
          <button
            key={code}
            type="button"
            onClick={() => toggle(code)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border transition-colors ${
              active ? "border-transparent text-white" : "bg-zinc-800 text-zinc-300 border-zinc-700"
            }`}
            style={active ? { backgroundColor: info.bg, color: info.color } : undefined}
          >
            {/* 브랜드 컬러 도트 */}
            {!active && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: info.bg }}
              />
            )}
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
