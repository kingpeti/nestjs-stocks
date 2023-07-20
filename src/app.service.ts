import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  finnHubBaseUrl: 'http://finnhub.io/api/v1';
  finnHubApiKey: 'ciqlqj9r01qjff7cr300ciqlqj9r01qjff7cr30g';
  constructor(private httpService: HttpService) {}
  async getStock(symbol: string) {
    try {
      const reply = await firstValueFrom(
        this.httpService.get(
          `${this.finnHubBaseUrl}/quote?symbol=${symbol}&token=${this.finnHubApiKey}`,
        ),
      );

      return reply.data;
    } catch (error) {
      return { error };
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
}
