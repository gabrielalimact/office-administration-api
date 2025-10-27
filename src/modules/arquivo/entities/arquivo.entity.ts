import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
}
