import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tipo_agendamento')
export class TipoAgendamento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nome: string;
}
