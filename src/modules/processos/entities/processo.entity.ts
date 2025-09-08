import { Cliente } from 'src/modules/cliente/entities/cliente.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('processos')
export class Processo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.processos)
  cliente: Cliente;

  @Column()
  colaborador: string;

  @Column()
  beneficio: string;

  @Column({ default: false })
  olhar_inss: boolean;

  @Column({ default: false })
  olhar_pje_creta: boolean;

  @Column({ nullable: true })
  senha_inss: string;

  @Column({ type: 'date' })
  data_atendimento: string;

  @Column()
  status: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'text', nullable: true })
  links_documentos: string[];
}
