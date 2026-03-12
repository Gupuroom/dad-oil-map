"use client";

import { useRef, useEffect } from "react";
import { useKakaoLoader, Map, CustomOverlayMap } from "react-kakao-maps-sdk";
import { MdMyLocation } from "react-icons/md";
import { motion } from "framer-motion";
import type { Station } from "@/src/types/station";
import { BrandLogo } from "./BrandLogo";

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY ?? "";
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청
const SHEET_HEIGHT_VH = 60; // SlidingSheet와 동일 값

interface MapViewProps {
  stations: Station[];
  userLocation: { lat: number; lng: number } | null;
  searchLocation: { lat: number; lng: number } | null;
  mapCenter: { lat: number; lng: number } | null;
  onLocate: () => void;
  onSelectStation: (station: Station) => void;
  isSheetExpanded: boolean;
}

export function MapView({
  stations,
  userLocation,
  searchLocation,
  mapCenter,
  onLocate,
  onSelectStation,
  isSheetExpanded,
}: MapViewProps) {
  const [loading] = useKakaoLoader({ appkey: KAKAO_APP_KEY });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // effect deps에 넣지 않고 최신 값만 읽기 위해 ref 사용
  const isSheetExpandedRef = useRef(isSheetExpanded);
  useEffect(() => {
    isSheetExpandedRef.current = isSheetExpanded;
  }, [isSheetExpanded]);

  // mapCenter 변경 시(버튼 클릭마다 새 객체) → panTo 직접 호출
  useEffect(() => {
    if (!mapCenter || !mapInstanceRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const kakao = (window as any).kakao;
    const map = mapInstanceRef.current;

    if (isSheetExpandedRef.current) {
      // 시트가 올라온 만큼(60vh의 절반) 아래로 보정 → 실제 보이는 영역의 정중앙에 위치
      const sheetOffsetPx = (window.innerHeight * SHEET_HEIGHT_VH) / 100 / 2;
      const projection = map.getProjection();
      const targetCoords = new kakao.maps.LatLng(mapCenter.lat, mapCenter.lng);
      const centerPoint = projection.pointFromCoords(targetCoords);
      const offsetPoint = new kakao.maps.Point(
        centerPoint.x,
        centerPoint.y + sheetOffsetPx
      );
      map.panTo(projection.coordsFromPoint(offsetPoint));
    } else {
      map.panTo(new kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
    }
  }, [mapCenter]); // mapCenter만 dep → 버튼 클릭 시에만 pan

  const cheapestPrice =
    stations.length > 0 ? Math.min(...stations.map((s) => s.price)) : null;

  return (
    <section
      className="map-container w-full bg-zinc-800 relative"
      data-purpose="kakao-style-map"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500">
          지도 불러오는 중...
        </div>
      )}
      {!loading && (
        <Map
          center={DEFAULT_CENTER}
          isPanto={false}
          onCreate={(map) => {
            mapInstanceRef.current = map;
          }}
          style={{ width: "100%", height: "100%" }}
          level={4}
          className="absolute inset-0"
        >
          {/* 주유소 가격 마커 */}
          {stations.map((station) => (
            <CustomOverlayMap
              key={station.id}
              position={{ lat: station.lat, lng: station.lng }}
              yAnchor={1}
            >
              <div
                className="marker-shadow flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => onSelectStation(station)}
              >
                <div
                  className={`flex items-center gap-1 font-bold px-3 py-2 rounded-full text-base ${
                    station.price === cheapestPrice
                      ? "bg-primary text-black"
                      : "bg-white text-black"
                  }`}
                >
                  <BrandLogo brand={station.brand} size="sm" />
                  {station.price.toLocaleString()}
                </div>
                <div
                  className={`w-3 h-3 rotate-45 -mt-1 ${
                    station.price === cheapestPrice ? "bg-primary" : "bg-white"
                  }`}
                />
              </div>
            </CustomOverlayMap>
          ))}

          {/* 내 위치 파란 점 */}
          {userLocation && (
            <CustomOverlayMap
              position={userLocation}
              yAnchor={0.5}
              xAnchor={0.5}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-10 h-10 rounded-full bg-blue-500/25 animate-ping" />
                <div className="absolute w-5 h-5 rounded-full bg-white shadow-md" />
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 z-10" />
              </div>
            </CustomOverlayMap>
          )}

          {/* 검색 위치 주황색 마커 */}
          {searchLocation && (
            <CustomOverlayMap
              position={searchLocation}
              yAnchor={0.5}
              xAnchor={0.5}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 rounded-full animate-ping"
                  style={{ backgroundColor: "rgba(239,68,68,0.25)" }} />
                <div className="absolute w-6 h-6 rounded-full bg-white shadow-md" />
                <div className="w-4 h-4 rounded-full z-10"
                  style={{ backgroundColor: "#EF4444" }} />
              </div>
            </CustomOverlayMap>
          )}
        </Map>
      )}

      {/* 내 위치로 이동 버튼 — 시트 상태에 따라 top 위치 전환 */}
      <motion.div
        className="absolute right-5 z-20"
        animate={{ top: isSheetExpanded ? "17.5rem" : "40rem" }}
        transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.9 }}
      >
        <button
          type="button"
          className="w-12 h-12 bg-zinc-800/90 backdrop-blur-md rounded-full border border-white/10 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="내 위치로 이동"
          onClick={onLocate}
        >
          <MdMyLocation className="w-5 h-5 text-white" size={20} />
        </button>
      </motion.div>
    </section>
  );
}
