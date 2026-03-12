import type { Station } from "@/src/types/station";
import { StationCard } from "./StationCard";

interface StationListProps {
  stations: Station[];
  loading: boolean;
  onSelectStation: (station: Station) => void;
}

function SkeletonCard() {
  return (
    <div className="bg-card p-5 rounded-custom border border-zinc-800 flex items-center gap-5 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-zinc-700 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-zinc-700 rounded w-3/4" />
        <div className="h-4 bg-zinc-700 rounded w-1/3" />
      </div>
      <div className="space-y-2 text-right">
        <div className="h-5 bg-zinc-700 rounded w-16" />
        <div className="h-3 bg-zinc-700 rounded w-12" />
      </div>
    </div>
  );
}

export function StationList({ stations, loading, onSelectStation }: StationListProps) {
  if (loading) {
    return (
      <div className="space-y-5" data-purpose="gas-station-cards">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-base">
        반경 5km 내 주유소가 없습니다.
      </div>
    );
  }

  const cheapestPrice = Math.min(...stations.map((s) => s.price));

  return (
    <div className="space-y-5" data-purpose="gas-station-cards">
      {stations.map((station) => (
        <StationCard
          key={station.id}
          name={station.name}
          distance={station.distance}
          price={station.price}
          brand={station.brand}
          lat={station.lat}
          lng={station.lng}
          isCheapest={station.price === cheapestPrice}
          onSelect={() => onSelectStation(station)}
        />
      ))}
    </div>
  );
}
