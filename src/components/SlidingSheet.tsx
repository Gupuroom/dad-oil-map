"use client";

import { useCallback, useEffect, useState } from "react";
import {
  motion,
  useTransform,
  useDragControls,
  useMotionValue,
  animate,
} from "framer-motion";
import type { Station } from "@/src/types/station";
import { ActionButtons } from "./ActionButtons";
import { BrandFilter } from "./BrandFilter";
import { StationList } from "./StationList";
import { SheetHandle } from "./SheetHandle";

const EXPANDED_HEIGHT_VH = 60;

// BottomNavigation 높이(py-4 + icon h-6 + gap-1.5 + text-sm ≈ 80px)
const BOTTOM_NAV_HEIGHT_PX = 80;
// 핸들 pill 영역 높이 (pt-4 + h-2 + pb-2)
const HANDLE_AREA_HEIGHT_PX = 32;
// "리스트 보기" 버튼 높이 (py-3 + text + pb-3 ≈ 56px)
const BUTTON_HEIGHT_PX = 56;
// 접혔을 때: BottomNav + 핸들 + 버튼 + 여백 → 버튼 하단이 BottomNav 바로 위에 위치
const COLLAPSED_HEIGHT_PX =
  BOTTOM_NAV_HEIGHT_PX + HANDLE_AREA_HEIGHT_PX + BUTTON_HEIGHT_PX + 8;

const spring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
  mass: 0.9,
};

interface SlidingSheetProps {
  stations: Station[];         // 전체 데이터 (필터 칩 목록 생성용)
  filteredStations: Station[]; // 필터 적용된 데이터 (리스트 표시용)
  loading: boolean;
  sort: 1 | 2;
  onSortChange: (sort: 1 | 2) => void;
  selectedBrands: Set<string>;
  onBrandFilterChange: (selected: Set<string>) => void;
  onSelectStation: (station: Station) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

export function SlidingSheet({
  stations,
  filteredStations,
  loading,
  sort,
  onSortChange,
  selectedBrands,
  onBrandFilterChange,
  onSelectStation,
  isExpanded,
  onExpandedChange,
}: SlidingSheetProps) {
  // y=0 → expanded, y=dragDistance → collapsed
  const [dragDistance, setDragDistance] = useState(0);
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  useEffect(() => {
    const expandedPx = window.innerHeight * (EXPANDED_HEIGHT_VH / 100);
    setDragDistance(expandedPx - COLLAPSED_HEIGHT_PX);
  }, []);

  const expand = useCallback(() => {
    onExpandedChange(true);
    animate(y, 0, spring);
  }, [y, onExpandedChange]);

  const collapse = useCallback(() => {
    onExpandedChange(false);
    animate(y, dragDistance, spring);
  }, [y, dragDistance, onExpandedChange]);

  const handleDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { y: number }; velocity: { y: number } }
    ) => {
      const VELOCITY_THRESHOLD = 300;
      const DISTANCE_THRESHOLD = dragDistance * 0.35;

      if (
        info.velocity.y > VELOCITY_THRESHOLD ||
        info.offset.y > DISTANCE_THRESHOLD
      ) {
        collapse();
      } else if (
        info.velocity.y < -VELOCITY_THRESHOLD ||
        info.offset.y < -DISTANCE_THRESHOLD
      ) {
        expand();
      } else {
        animate(y, isExpanded ? 0 : dragDistance, spring);
      }
    },
    [isExpanded, dragDistance, expand, collapse, y]
  );

  const listOpacity = useTransform(y, [0, dragDistance * 0.4], [1, 0]);

  return (
    <>
      {/* 핸들: z-30으로 BottomNav(z-20) 위에 항상 노출 */}
      <SheetHandle
        y={y}
        isExpanded={isExpanded}
        expandedHeightVh={EXPANDED_HEIGHT_VH}
        spring={spring}
        onPointerDown={(e) => dragControls.start(e)}
        onExpand={expand}
      />

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-10 flex flex-col bg-dark rounded-t-[20px] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
        style={{ height: `${EXPANDED_HEIGHT_VH}vh`, y }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: dragDistance }}
        dragElastic={{ top: 0.08, bottom: 0.08 }}
        onDragEnd={handleDragEnd}
      >
        {/* SheetHandle 높이만큼 시트 상단 여백 */}
        <div style={{ height: HANDLE_AREA_HEIGHT_PX }} className="shrink-0" />

        {/* 스크롤 가능한 리스트 콘텐츠 */}
        <motion.div
          className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-20 min-h-0 [&::-webkit-scrollbar]:hidden"
          style={{ opacity: listOpacity }}
        >
          <ActionButtons sort={sort} onSortChange={onSortChange} />
          <BrandFilter
            stations={stations}
            selected={selectedBrands}
            onChange={onBrandFilterChange}
          />
          <StationList stations={filteredStations} loading={loading} onSelectStation={onSelectStation} />
        </motion.div>
      </motion.div>
    </>
  );
}
