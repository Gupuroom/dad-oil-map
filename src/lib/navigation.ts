/**
 * 외부 내비게이션 앱으로 길찾기 실행
 * 1순위: TMap 앱 딥링크
 * 폴백: 카카오맵 웹 (앱 미설치 시 브라우저에서 바로 사용 가능)
 */
export function openNavigation(name: string, lat: number, lng: number) {
  // TMap 딥링크 (X=경도, Y=위도)
  const tmapUrl =
    `tmap://route?rGoName=${encodeURIComponent(name)}&rGoLat=${lat}&rGoLon=${lng}`;

  // 카카오맵 웹 폴백 (앱 없어도 브라우저에서 길찾기 됨)
  const kakaoFallback =
    `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;

  // TMap 열기 시도
  window.location.href = tmapUrl;

  // 1.5초 후에도 페이지가 그대로면 TMap 미설치 → 카카오맵으로 폴백
  setTimeout(() => {
    window.open(kakaoFallback, "_blank");
  }, 1500);
}
