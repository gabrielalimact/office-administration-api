import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Processo } from './processo.entity';
import { TipoAgendamento } from './agendamento.entity';

@Entity('processo_agendamentos')
export class ProcessoAgendamento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Processo, (processo) => processo.agendamentos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'processo_id' })
  processo: Processo;

  @ManyToOne(() => TipoAgendamento, { eager: true })
  @JoinColumn({ name: 'tipo_agendamento_id' })
  tipo_agendamento: TipoAgendamento;

  @Column({ type: 'timestamp' })
  data_agendamento: Date;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ default: false })
  concluido: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
