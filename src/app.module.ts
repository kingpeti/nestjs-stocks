import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StocksDataEntity } from './stock-data.entity';
import { StockSymbolEntity } from './stock-symbol.entity';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'nest',
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([StocksDataEntity, StockSymbolEntity]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
