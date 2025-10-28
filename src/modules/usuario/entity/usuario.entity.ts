import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Arquivo } from '../../arquivo/entities/arquivo.entity';

export enum CargoUsuario {
  FUNCIONARIO = 'funcionario',
  SOCIO = 'socio',
}

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  senha: string;

  @Column({
    type: 'enum',
    enum: CargoUsuario,
    nullable: false,
  })
  cargo: CargoUsuario;

  @Column({ nullable: true })
  id_imagem?: number;

  @ManyToOne(() => Arquivo, { nullable: true })
  @JoinColumn({ name: 'id_imagem' })
  imagem?: Arquivo;
}
