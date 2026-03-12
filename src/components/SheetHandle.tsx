"use client";

import { motion, AnimatePresence, type MotionValue } from "framer-motion";

interface SheetHandleProps {
  y: MotionValue<number>;
  isExpanded: boolean;
  expandedHeightVh: number;
  spring: object;
  onPointerDown: (e: React.PointerEvent) => void;
  onExpand: () => void;
}

/**
 * 시트 핸들 + "리스트 보기" 버튼.
 * 시트(z-10), BottomNav(z-20) 위인 z-30으로 고정되어 항상 노출됩니다.
 */
export function SheetHandle({
  y,
  isExpanded,
  expandedHeightVh,
  spring,
  onPointerDown,
  onExpand,
}: SheetHandleProps) {
  return (
    <motion.div
      className="fixed left-0 right-0 z-30 flex flex-col items-center touch-none select-none"
      style={{
        top: `calc(100vh - ${expandedHeightVh}vh)`,
        y,
      }}
    >
      {/* 드래그 핸들 pill */}
      <div
        className="w-full flex flex-col items-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onClick={isExpanded ? undefined : onExpand}
        onKeyDown={(e) => {
          if (!isExpanded && (e.key === "Enter" || e.key === " ")) onExpand();
        }}
        role={isExpanded ? undefined : "button"}
        tabIndex={isExpanded ? -1 : 0}
        aria-label={isExpanded ? undefined : "리스트 펼치기"}
      >
        <div className="w-14 h-2 bg-zinc-600 rounded-full" />
      </div>

      {/* 접혔을 때 나타나는 "리스트 보기" 버튼 */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            type="button"
            className="w-full mx-0 px-5 pb-3"
            onClick={onExpand}
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={spring}
          >
            <span className="block w-full py-3 bg-primary text-dark font-bold text-base rounded-custom text-center">
              리스트 보기
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
