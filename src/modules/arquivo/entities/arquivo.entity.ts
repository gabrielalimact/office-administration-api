import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Processo } from '../../processos/entities/processo.entity';

@Entity('arquivos')
export class Arquivo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome_original: string;

  @Column()
  nome_arquivo: string;

  @Column()
  caminho: string;

  @Column()
  tamanho: number;

  @Column()
  tipo_mime: string;

  @CreateDateColumn()
  data_upload: Date;

  @ManyToOne(() => Processo, (processo) => processo.documentos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'processo_id' })
  processo?: Processo;
}
