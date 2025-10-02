import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';

@Entity('relatorios')
export class Relatorio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  funcionario: Usuario;

  @Column({ type: 'text' })
  conteudo: string;

  @CreateDateColumn()
  created_at: Date;
}
