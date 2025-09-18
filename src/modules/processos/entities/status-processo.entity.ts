import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('status_processo')
export class StatusProcesso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nome: string;
}
