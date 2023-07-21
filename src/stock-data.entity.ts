import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StockSymbolEntity } from './stock-symbol.entity';
import { StockData } from './stock.interfaces';

@Entity()
export class StocksDataEntity implements StockData {
  @PrimaryGeneratedColumn() id: number;

  @ManyToOne(() => StockSymbolEntity, (symbol) => symbol.name, { onDelete: 'CASCADE' })
  symbol: StockSymbolEntity;

  @Column() c: number;

  @Column() d: number;

  @Column() dp: number;

  @Column() h: number;

  @Column() l: number;

  @Column() o: number;

  @Column() pc: number;

  @Column() t: number;
}
