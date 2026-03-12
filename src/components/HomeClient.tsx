"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Station } from "@/src/types/station";
import { MapView } from "./MapView";
import { SlidingSheet } from "./SlidingSheet";
import { SearchBar } from "./SearchBar";
import { NavigationConfirmModal } from "./NavigationConfirmModal";
import { BottomNavigation } from "./BottomNavigation";

type UserLocation = { lat: number; lng: number };

// 좌표를 소수점 3자리로 반올림 (서버와 동일 기준)
const round3 = (n: number) => Math.round(n * 1000) / 1000;
const cacheKey = (lat: number, lng: number, sort: number) =>
  `${round3(lat)},${round3(lng)},${sort}`;

export function HomeClient() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  // null = GPS 모드, string = 검색 장소 이름
  const [searchPlaceName, setSearchPlaceName] = useState<string | null>(null);
  // 검색된 장소 좌표 (지도 마커용)
  const [searchLocation, setSearchLocation] = useState<UserLocation | null>(null);

  const locationRef = useRef<UserLocation | null>(null);   // GPS 위치
  const activeLocRef = useRef<UserLocation | null>(null);  // 현재 검색 기준 (GPS or 검색 장소)
  const cache = useRef<Map<string, Station[]>>(new Map());

  const fetchStations = useCallback(
    async (loc: UserLocation, sortVal: 1 | 2) => {
      const key = cacheKey(loc.lat, loc.lng, sortVal);

      const cached = cache.current.get(key);
      if (cached) {
        setStations(cached);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/stations?lat=${loc.lat}&lng=${loc.lng}&sort=${sortVal}`
        );
        const data: Station[] | { error: string } = await res.json();
        if (Array.isArray(data)) {
          cache.current.set(key, data);
          setStations(data);
        }
      } catch {
        // 네트워크 오류 시 기존 리스트 유지
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** GPS 위치 취득 */
  const locate = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        locationRef.current = loc;
        activeLocRef.current = loc;
        setUserLocation(loc);
        setMapCenter({ ...loc });
        setSearchPlaceName(null);
        setSearchLocation(null); // GPS 모드로 복귀 → 검색 마커 제거
        fetchStations(loc, sort);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [sort, fetchStations]);

  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 장소 검색 선택 → 해당 위치 기준으로 재검색 */
  const handlePlaceSelect = useCallback(
    (lat: number, lng: number, name: string) => {
      const loc: UserLocation = { lat, lng };
      activeLocRef.current = loc;
      setMapCenter({ ...loc });
      setSearchPlaceName(name);
      setSearchLocation({ ...loc }); // 검색 마커 표시
      setSelectedBrands(new Set()); // 브랜드 필터 초기화
      fetchStations(loc, sort);
    },
    [sort, fetchStations]
  );

  /** 내 위치로 돌아가기 */
  const handleReturnToMyLocation = useCallback(() => {
    locate();
  }, [locate]);

  /** 정렬 변경 → 현재 활성 위치(GPS or 검색)로 재검색 */
  const handleSortChange = useCallback(
    (newSort: 1 | 2) => {
      setSort(newSort);
      const loc = activeLocRef.current;
      if (loc) fetchStations(loc, newSort);
    },
    [fetchStations]
  );

  const filteredStations =
    selectedBrands.size === 0
      ? stations
      : stations.filter((s) => selectedBrands.has(s.brand));

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      <MapView
        stations={filteredStations}
        userLocation={userLocation}
        searchLocation={searchLocation}
        mapCenter={mapCenter}
        onLocate={locate}
        onSelectStation={setSelectedStation}
        isSheetExpanded={isSheetExpanded}
      />

      {/* 장소 검색바 — 지도 위 절대 위치 */}
      <SearchBar
        isSearchMode={searchPlaceName !== null}
        onSelectPlace={handlePlaceSelect}
        onReturnToMyLocation={handleReturnToMyLocation}
      />

      <SlidingSheet
        stations={stations}
        filteredStations={filteredStations}
        loading={loading}
        sort={sort}
        onSortChange={handleSortChange}
        selectedBrands={selectedBrands}
        onBrandFilterChange={setSelectedBrands}
        onSelectStation={setSelectedStation}
        isExpanded={isSheetExpanded}
        onExpandedChange={setIsSheetExpanded}
      />
      <BottomNavigation />
      <NavigationConfirmModal
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  );
}
