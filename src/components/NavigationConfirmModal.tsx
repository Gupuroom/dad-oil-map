"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt } from "react-icons/fa";
import type { Station } from "@/src/types/station";
import { BrandLogo } from "./BrandLogo";
import { openNavigation } from "@/src/lib/navigation";

interface Props {
  station: Station | null;
  onClose: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function NavigationConfirmModal({ station, onClose }: Props) {
  const handleConfirm = () => {
    if (!station) return;
    openNavigation(station.name, station.lat, station.lng);
    onClose();
  };

  return (
    <AnimatePresence>
      {station && (
        <>
          {/* 딤 배경 — 클릭 시 닫기 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* 바텀시트 모달 */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10 shadow-[0_-8px_40px_rgba(0,0,0,0.6)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 36, mass: 0.8 }}
          >
            {/* 핸들 */}
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />

            {/* 주유소 정보 */}
            <div className="flex items-center gap-4 mb-8 px-1">
              <BrandLogo brand={station.brand} />
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-white truncate leading-tight">
                  {station.name}
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  {formatDistance(station.distance)}
                  <span className="mx-2 text-zinc-600">·</span>
                  <span className="text-primary font-bold">
                    {station.price.toLocaleString()}원
                  </span>
                  <span className="text-zinc-500">/L</span>
                </p>
              </div>
            </div>

            {/* TMap 길찾기 버튼 */}
            <button
              type="button"
              className="w-full bg-primary text-black font-black text-lg py-4 rounded-2xl flex items-center justify-center gap-2.5 mb-3 active:scale-[0.97] transition-transform shadow-lg shadow-primary/20"
              onClick={handleConfirm}
            >
              <FaMapMarkerAlt size={18} />
              TMap으로 길찾기
            </button>

            {/* 취소 버튼 */}
            <button
              type="button"
              className="w-full bg-zinc-800 text-zinc-400 font-bold text-base py-4 rounded-2xl active:scale-[0.97] transition-transform border border-zinc-700"
              onClick={onClose}
            >
              취소
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
