export interface Station {
  id: string;
  brand: string; // POLL_DIV_CD: SKE, GSC, HDO, SOL, RTO, RTX, NHO, E1Y, ETC …
  name: string;
  price: number;
  distance: number; // 단위: 미터
  lat: number;
  lng: number;
}
