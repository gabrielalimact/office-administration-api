import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { StatusProcesso } from './status-processo.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Beneficio } from './beneficios.entity';

@Entity('processos')
export class Processo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.processos)
  cliente: Cliente;

  @Column()
  colaborador: string;

  @ManyToOne(() => Beneficio)
  beneficio: Beneficio;

  @Column({ default: false })
  arquivado: boolean;

  @Column({ default: false })
  olhar_inss: boolean;

  @Column({ default: false })
  olhar_pje_creta: boolean;

  @Column({ nullable: true })
  senha_inss: string;

  @Column({ type: 'date' })
  data_atendimento: string;

  @Column({ type: 'date' })
  data_ultima_atualizacao: string;

  @ManyToOne(() => StatusProcesso)
  status: StatusProcesso;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'text', nullable: true })
  links_documentos: string[];
}
