import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CargoUsuario {
  FUNCIONARIO = 'FUNCIONÁRIO(A)',
  SOCIO = 'SÓCIO(A)',
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
}
