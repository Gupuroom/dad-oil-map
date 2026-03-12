import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import proj4 from "proj4";

// 오피넷 전용 KATEC 좌표계 정의
const WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
const KATEC =
  "+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs";

// 좌표를 소수점 3자리로 반올림 → 약 100m 반경 내 같은 위치로 인식 (캐시 히트율 ↑)
const round3 = (n: number) => Math.round(n * 1000) / 1000;

interface OpinetOil {
  UNI_ID: string;
  POLL_DIV_CD: string;
  OS_NM: string;
  PRICE: number;
  DISTANCE: number;
  GIS_X_COOR: number;
  GIS_Y_COOR: number;
}

// Opinet 실제 호출을 30분 캐시 (1800초)
// 같은 (lat, lng, sort) 조합이면 캐시된 데이터 반환 → API 횟수 절약
const fetchOpinetCached = unstable_cache(
  async (lat: number, lng: number, sort: string) => {
    const [x, y] = proj4(WGS84, KATEC, [lng, lat]);

    const apiKey = process.env.OPINET_CODE;
    const url = `https://www.opinet.co.kr/api/aroundAll.do?code=${apiKey}&x=${Math.round(x)}&y=${Math.round(y)}&radius=5000&sort=${sort}&prodcd=B027&out=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Opinet HTTP ${res.status}`);

    const data = await res.json();
    const oilList: OpinetOil[] = data?.RESULT?.OIL ?? [];

    return oilList.map((oil) => {
      const [wgsLng, wgsLat] = proj4(KATEC, WGS84, [
        oil.GIS_X_COOR,
        oil.GIS_Y_COOR,
      ]);
      return {
        id: oil.UNI_ID,
        brand: oil.POLL_DIV_CD,
        name: oil.OS_NM,
        price: oil.PRICE,
        distance: oil.DISTANCE,
        lat: wgsLat,
        lng: wgsLng,
      };
    });
  },
  ["opinet-stations"],
  { revalidate: 1800 } // 30분
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLat = parseFloat(searchParams.get("lat") ?? "");
  const rawLng = parseFloat(searchParams.get("lng") ?? "");
  const sort = searchParams.get("sort") ?? "1";

  if (isNaN(rawLat) || isNaN(rawLng)) {
    return NextResponse.json(
      { error: "위치 정보가 필요합니다." },
      { status: 400 }
    );
  }

  // 캐시 키 단위를 줄이기 위해 좌표 반올림 (±100m 오차, 반경 5km 검색이라 무의미)
  const lat = round3(rawLat);
  const lng = round3(rawLng);

  try {
    const stations = await fetchOpinetCached(lat, lng, sort);
    return NextResponse.json(stations);
  } catch (err) {
    console.error("[Opinet] fetch error:", err);
    return NextResponse.json(
      { error: "주유소 데이터를 가져오지 못했습니다." },
      { status: 500 }
    );
  }
}
