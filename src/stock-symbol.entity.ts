import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StocksDataEntity } from './stock-data.entity';

@Entity()
export class StockSymbolEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  @OneToMany(() => StocksDataEntity, (stock) => stock.symbol)
  stock: StocksDataEntity[];
}
