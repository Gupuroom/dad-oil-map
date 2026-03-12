"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaSearch, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface SearchBarProps {
  isSearchMode: boolean;
  onSelectPlace: (lat: number, lng: number, name: string) => void;
  onReturnToMyLocation: () => void;
}

export function SearchBar({
  isSearchMode,
  onSelectPlace,
  onReturnToMyLocation,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 300ms 디바운스 검색
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setIsOpen(true);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback(
    (place: Place) => {
      setQuery(place.name);
      setIsOpen(false);
      onSelectPlace(place.lat, place.lng, place.name);
    },
    [onSelectPlace]
  );

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleReturn = () => {
    handleClear();
    onReturnToMyLocation();
  };

  return (
    <div ref={containerRef} className="absolute top-5 left-5 right-5 z-30">
      {/* 검색 입력창 */}
      <div className="flex items-center gap-3 bg-zinc-900/95 backdrop-blur-md rounded-2xl px-4 py-3.5 shadow-xl border border-white/10">
        {searching ? (
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-primary rounded-full animate-spin shrink-0" />
        ) : (
          <FaSearch className="text-zinc-400 shrink-0" size={15} />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="장소 검색..."
          className="flex-1 bg-transparent text-white placeholder-zinc-500 text-base outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-zinc-500 active:text-zinc-300 transition-colors"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="mt-2 bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              className="w-full flex items-start gap-3 px-4 py-3.5 text-left active:bg-zinc-800 border-b border-zinc-800/60 last:border-0 transition-colors"
              onClick={() => handleSelect(place)}
            >
              <FaMapMarkerAlt
                className="text-primary shrink-0 mt-0.5"
                size={13}
              />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {place.name}
                </p>
                <p className="text-zinc-500 text-xs truncate mt-0.5">
                  {place.address}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 내 위치로 돌아가기 — 검색 모드일 때만 표시 */}
      {isSearchMode && (
        <button
          type="button"
          onClick={handleReturn}
          className="mt-2 flex items-center gap-2 bg-zinc-900/95 backdrop-blur-md text-primary font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg border border-primary/30 active:scale-95 transition-transform"
        >
          <MdMyLocation size={16} />
          내 위치로 돌아가기
        </button>
      )}
    </div>
  );
}
