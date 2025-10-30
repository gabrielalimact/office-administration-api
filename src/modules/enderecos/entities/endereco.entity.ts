import { Cliente } from '../../cliente/entities/cliente.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  logradouro: string;

  @Column({ default: '' })
  numero: string;

  @Column({ default: '' })
  complemento: string;

  @Column({ default: '' })
  bairro: string;

  @Column({ default: '' })
  cidade: string;

  @Column({ default: '' })
  estado: string;

  @Column({ default: '' })
  cep: string;

  @OneToOne(() => Cliente, (cliente) => cliente.endereco)
  cliente: Cliente;
}
