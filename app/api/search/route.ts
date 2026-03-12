import { NextRequest, NextResponse } from "next/server";

const KAKAO_HEADERS = () => ({
  Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlace(doc: any, index: number) {
  return {
    // 키워드/주소 결과 간 id 충돌 방지용 prefix
    id: doc.id ?? `addr-${index}`,
    name: doc.place_name || doc.address_name,
    address: doc.road_address_name || doc.address_name || "",
    lat: parseFloat(doc.y),
    lng: parseFloat(doc.x),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const encoded = encodeURIComponent(query);
  const headers = KAKAO_HEADERS();

  // 키워드 검색 + 주소 검색 병렬 호출
  const [keywordRes, addressRes] = await Promise.allSettled([
    fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encoded}&size=6`,
      { headers, cache: "no-store" }
    ),
    fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encoded}&size=4`,
      { headers, cache: "no-store" }
    ),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keywordDocs: any[] =
    keywordRes.status === "fulfilled" && keywordRes.value.ok
      ? (await keywordRes.value.json()).documents ?? []
      : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addressDocs: any[] =
    addressRes.status === "fulfilled" && addressRes.value.ok
      ? (await addressRes.value.json()).documents ?? []
      : [];

  // 키워드 결과 우선, 주소 결과를 뒤에 추가
  // 주소 API는 place_name 없이 address_name/x/y 구조
  const keywordPlaces = keywordDocs.map((doc, i) => toPlace(doc, i));
  const addressPlaces = addressDocs
    .map((doc, i) => ({
      id: `addr-${i}`,
      name: doc.address_name,
      address: doc.road_address?.address_name || doc.address_name,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
    }))
    // 키워드 결과와 위치가 같은 중복 제거
    .filter(
      (a) =>
        !keywordPlaces.some(
          (k) => Math.abs(k.lat - a.lat) < 0.0001 && Math.abs(k.lng - a.lng) < 0.0001
        )
    );

  return NextResponse.json([...keywordPlaces, ...addressPlaces]);
}
