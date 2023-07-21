export type StockPriceData = {
  symbol: string;
  price: number;
  lastUpdated: Date;
  movingAverage: number;
};

export interface StockData {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}
