import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('beneficios')
export class Beneficio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nome: string;
}
