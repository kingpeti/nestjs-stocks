export type StockPriceData = {
  symbol: string;
  price: number;
  lastUpdated: Date;
  movingAverage: number;
};

export type StockData = {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};
