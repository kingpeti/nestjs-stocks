import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { StockData, StockPriceData } from './stock.interfaces';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly finnHubBaseUrl = 'finnhub.io/api/v1';
  private readonly finnHubApiKey = 'ciqlqj9r01qjff7cr300ciqlqj9r01qjff7cr30g';
  private stocksData: { [symbol: string]: Array<StockData> } = {};
  constructor(private httpService: HttpService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  private async handleCron() {
    for (const symbol in this.stocksData) {
      const stock = await this.getStock(symbol);
      if ((stock as Error).message) {
        this.logger.error((stock as Error).message);
      } else {
        this.stocksData[symbol].push(stock as StockData);
        if (this.stocksData[symbol].length > 10) {
          this.stocksData[symbol].shift();
        }
      }
    }
  }

  private async getStock(symbol: string): Promise<StockData | Error> {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.finnHubBaseUrl}/quote?symbol=${symbol}&token=${this.finnHubApiKey}`));
      this.logger.debug(response.data);
      if (response.status === 429) {
        this.logger.error('response.data');
        this.logger.error(response.data);

        const secondsToWait = Number(response.headers['retry-after']);
        await new Promise((resolve) => setTimeout(resolve, secondsToWait * 1000));
        return this.getStock(symbol);
      }
      return response.data;
    } catch (error) {
      this.logger.error(error);
      return error;
    }
  }

  public async addStockSymbol(symbol: string) {
    if (!this.stocksData[symbol]) {
      const stock = await this.getStock(symbol);
      if ((stock as Error).message) {
        throw new HttpException((stock as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      this.stocksData[symbol] = [stock as StockData];
      this.logger.debug(`Adding ${symbol} to watchlist`);
      return `${symbol} added to watchlist`;
    }
    return `${symbol} already on the watchlist`;
  }

  public async getStockData(symbol: string): Promise<StockPriceData | string> {
    const length = this.stocksData[symbol]?.length;
    if (length) {
      return {
        symbol,
        price: this.stocksData[symbol][length - 1].c,
        lastUpdated: new Date(this.stocksData[symbol][length - 1].t * 1000),
        movingAverage: this.calculateMovingAverage(symbol),
      };
    } else {
      return length === 0 ? 'chron not yet runs' : 'You should add the symbol first';
    }
  }

  public async deleteStock(symbol: string) {
    this.logger.debug(`Deleting ${symbol}`);
    if (this.stocksData[symbol]) {
      this.stocksData[symbol] = null;
      return 'Symbol deleted from watchlist';
    } else {
      return 'You should add the symbol first';
    }
  }

  private calculateMovingAverage(symbol: string) {
    let sum = 0;
    this.stocksData[symbol].forEach((stock) => {
      sum += stock.c;
    });
    return sum / this.stocksData[symbol].length;
  }

  public getHello(): string {
    return 'Hello World!';
  }
}
