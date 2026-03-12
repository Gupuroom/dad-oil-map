export interface BrandInfo {
  label: string;
  bg: string;
  color: string;
}

export const BRAND_MAP: Record<string, BrandInfo> = {
  SKE: { label: "SK", bg: "#FF6B00", color: "#fff" },
  GSC: { label: "GS", bg: "#00A651", color: "#fff" },
  HDO: { label: "HD", bg: "#003087", color: "#fff" },
  SOL: { label: "S-OIL", bg: "#E63329", color: "#fff" },
  RTO: { label: "알뜰", bg: "#4B5563", color: "#fff" },
  RTX: { label: "알뜰", bg: "#4B5563", color: "#fff" },
  NHO: { label: "NH", bg: "#1A6B30", color: "#fff" },
  E1Y: { label: "E1", bg: "#F5C518", color: "#111" },
  ETC: { label: "기타", bg: "#374151", color: "#9CA3AF" },
};

interface BrandLogoProps {
  brand: string;
  size?: "lg" | "sm";
}

export function BrandLogo({ brand, size = "lg" }: BrandLogoProps) {
  const info = BRAND_MAP[brand] ?? BRAND_MAP.ETC;

  if (size === "sm") {
    return (
      <span
        className="inline-flex items-center justify-center rounded px-1 font-black text-[9px] leading-none h-4"
        style={{ backgroundColor: info.bg, color: info.color }}
      >
        {info.label}
      </span>
    );
  }

  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 font-black text-sm leading-tight text-center"
      style={{ backgroundColor: info.bg, color: info.color }}
    >
      {info.label}
    </div>
  );
}
