import { Endereco } from '../../enderecos/entities/endereco.entity';
import { Processo } from '../../processos/entities/processo.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  data_nascimento: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ nullable: true })
  rg: string;

  @Column({ nullable: true })
  filiacao: string;

  @Column({ nullable: true })
  naturalidade: string;

  @OneToOne(() => Endereco, (endereco) => endereco.cliente, { cascade: true })
  @JoinColumn({ name: 'id_endereco' })
  endereco: Endereco;

  @OneToMany(() => Processo, (processo) => processo.cliente)
  processos: Processo[];
}
