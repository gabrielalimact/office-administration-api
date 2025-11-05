import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { StatusProcesso } from './status-processo.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Beneficio } from './beneficios.entity';
import { Arquivo } from '../../arquivo/entities/arquivo.entity';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { TipoAgendamento } from './agendamento.entity';

@Entity('processos')
export class Processo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.processos, {
    onDelete: 'CASCADE',
  })
  cliente: Cliente;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_colaborador' })
  colaborador: Usuario;

  @ManyToOne(() => Beneficio)
  beneficio: Beneficio;

  @ManyToOne(() => TipoAgendamento)
  tipo_agendamento: TipoAgendamento;

  @Column({ default: false })
  arquivado: boolean;

  @Column({ default: false })
  olhar_inss: boolean;

  @Column({ default: false })
  olhar_pje_creta: boolean;

  @Column({ nullable: true })
  senha_inss: string;

  @Column({ type: 'date' })
  data_cadastro: string;

  @Column({ type: 'timestamp', nullable: true })
  data_agendamento: string;

  @Column({ type: 'date' })
  data_ultima_atualizacao: string;

  @ManyToOne(() => StatusProcesso)
  status: StatusProcesso;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @OneToMany(() => Arquivo, (arquivo) => arquivo.processo, {
    cascade: true,
  })
  documentos: Arquivo[];
}
