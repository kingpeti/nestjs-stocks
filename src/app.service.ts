import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { StockData, StockPriceData } from './stock.interfaces';
import { StocksDataEntity } from './stock-data.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StockSymbolEntity } from './stock-symbol.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly finnHubBaseUrl = '//finnhub.io/api/v1';
  private readonly finnHubApiKey = 'ciqlqj9r01qjff7cr300ciqlqj9r01qjff7cr30g';
  private readonly manager: EntityManager;
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(StocksDataEntity) private readonly stocksDataRepository: Repository<StocksDataEntity>,
    @InjectRepository(StockSymbolEntity) private readonly stockSymbolRepository: Repository<StockSymbolEntity>
  ) {
    this.manager = this.stockSymbolRepository.manager;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async handleCron() {
    this.stockSymbolRepository.find().then((symbols) => {
      symbols.forEach(async (symbol) => {
        const stock = await this.getStock(symbol.name);
        if ((stock as Error).message) {
          this.logger.error((stock as Error).message);
        } else {
          await this.stocksDataRepository.save({ ...(stock as StockData), symbol });
          await this.stocksDataRepository.findAndCount({ where: { symbol: { name: symbol.name } } }).then(([data, count]) => {
            if (count > 10) this.stocksDataRepository.delete(data[0]);
          });
        }
      });
    });
  }

  private async getStock(symbol: string): Promise<StockData | Error> {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.finnHubBaseUrl}/quote?symbol=${symbol}&token=${this.finnHubApiKey}`));
      this.logger.debug(response.data);
      if (response.data.d === null) {
        this.deleteStock(symbol);
        this.logger.error(response.data);
        return new Error('Symbol not available');
      }
      if (response.status === 429) {
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
    const isSymbolExists = await this.manager.exists(StockSymbolEntity, { where: { name: symbol } });
    if (!isSymbolExists) {
      const stock = await this.getStock(symbol);
      if ((stock as Error).message) {
        throw new HttpException((stock as Error).message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      await this.stockSymbolRepository.save({ name: symbol });
      this.logger.debug(`Adding ${symbol} to watchlist`);
      return `${symbol} added to watchlist`;
    }
    return `${symbol} already on the watchlist`;
  }

  public async getStockData(symbol: string): Promise<StockPriceData | string> {
    const isSymbolExists = await this.manager.exists(StockSymbolEntity, { where: { name: symbol } });
    if (!isSymbolExists) {
      return 'You should add the symbol first';
    }
    const [data, length] = await this.stocksDataRepository.findAndCount({ where: { symbol: { name: symbol } }, take: 10, order: { id: 'DESC' } });
    if (length) {
      return {
        symbol,
        price: data[0].c,
        lastUpdated: new Date(data[0].t * 1000),
        movingAverage: this.calculateMovingAverage(data),
      };
    } else {
      return 'Chron not yet runs';
    }
  }

  public async deleteStock(symbol: string) {
    this.logger.debug(`Deleting ${symbol}`);

    const isSymbolExists = await this.manager.exists(StockSymbolEntity, { where: { name: symbol } });
    if (isSymbolExists) {
      this.manager.delete(StockSymbolEntity, { name: symbol });
      return 'Symbol deleted from watchlist';
    } else {
      return 'You should add the symbol first';
    }
  }

  private calculateMovingAverage(data: StocksDataEntity[]) {
    let sum = 0;
    data.forEach((stock) => {
      sum += stock.c;
    });
    return sum / data.length;
  }

  public getHello(): string {
    return 'Hello World!';
  }
}
