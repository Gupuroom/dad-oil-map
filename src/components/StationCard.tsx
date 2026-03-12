"use client";

import { FaMapMarkerAlt } from "react-icons/fa";
import { BrandLogo } from "./BrandLogo";

interface StationCardProps {
  name: string;
  distance: number; // 미터
  price: number;
  brand: string;
  lat: number;
  lng: number;
  isCheapest?: boolean;
  onSelect: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function StationCard({
  name,
  distance,
  price,
  brand,
  lat: _lat,
  lng: _lng,
  isCheapest = false,
  onSelect,
}: StationCardProps) {
  return (
    <article
      className={`bg-card p-5 rounded-custom border flex items-center gap-5 cursor-pointer active:scale-[0.98] transition-transform ${
        isCheapest ? "border-primary/50" : "border-zinc-800"
      }`}
      onClick={onSelect}
    >
      <BrandLogo brand={brand} />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base text-zinc-100 truncate">{name}</h3>
        <p className="text-zinc-500 text-base">{formatDistance(distance)}</p>
        {isCheapest && (
          <span className="text-xs font-black text-primary mt-0.5 inline-block tracking-wide">
            ★ 최저가
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right shrink-0">
          <div
            className={`text-lg font-black ${isCheapest ? "text-primary" : "text-zinc-100"}`}
          >
            {price.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500 uppercase">KRW / L</div>
        </div>
        {/* 길찾기 아이콘 힌트 */}
        <FaMapMarkerAlt
          className={`shrink-0 ${isCheapest ? "text-primary" : "text-zinc-500"}`}
          size={18}
        />
      </div>
    </article>
  );
}
