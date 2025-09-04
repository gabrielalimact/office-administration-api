import { Endereco } from 'src/modules/enderecos/entities/endereco.entity';
import { Processo } from 'src/modules/processos/entities/processo.entity';
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

  @Column({ type: 'date' })
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
