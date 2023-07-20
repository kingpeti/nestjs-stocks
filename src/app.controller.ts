import { Param } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('stock/:symbol')
  async getPrice(@Param('symbol') symbol: string) {
    return this.appService.getStock(symbol);
  }
}