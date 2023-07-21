import { Delete, Param, Post } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('stock Api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('stock/:symbol')
  async postStock(@Param('symbol') symbol: string) {
    return this.appService.addStockSymbol(symbol.toUpperCase());
  }

  @Get('stock/:symbol')
  async getStock(@Param('symbol') symbol: string) {
    return this.appService.getStockData(symbol.toUpperCase());
  }

  @Delete('stock/:symbol')
  async deleteStock(@Param('symbol') symbol: string) {
    return this.appService.deleteStock(symbol.toUpperCase());
  }
}
