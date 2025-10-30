import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';

export enum TipoAcao {
  CRIAR = 'CRIAR',
  ATUALIZAR = 'ATUALIZAR',
  DELETAR = 'DELETAR',
  ENVIAR_DOCUMENTO = 'ENVIAR_DOCUMENTO',
  REMOVER_DOCUMENTO = 'REMOVER_DOCUMENTO',
  ARQUIVAR_PROCESSO = 'ARQUIVAR_PROCESSO',
  DESARQUIVAR_PROCESSO = 'DESARQUIVAR_PROCESSO',
}

export enum TipoEntidade {
  CLIENTE = 'CLIENTE',
  PROCESSO = 'PROCESSO',
  USUARIO = 'USUARIO',
  ENDERECO = 'ENDERECO',
  ARQUIVO = 'ARQUIVO',
  STATUS_PROCESSO = 'STATUS_PROCESSO',
  BENEFICIO = 'BENEFICIO',
  RELATORIO = 'RELATORIO',
}

@Entity('auditoria_logs')
@Index(['entidade_tipo', 'entidade_id'])
@Index(['usuario_id', 'data_acao'])
@Index(['acao', 'data_acao'])
export class AuditoriaLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { eager: true, onDelete: 'SET NULL' })
  usuario: Usuario;

  @Column()
  usuario_id: number;

  @Column({
    type: 'enum',
    enum: TipoAcao,
  })
  acao: TipoAcao;

  @Column({
    type: 'enum',
    enum: TipoEntidade,
  })
  entidade_tipo: TipoEntidade;

  @Column()
  entidade_id: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  descricao: string;

  @Column({ type: 'jsonb', nullable: true })
  dados_anteriores: any;

  @Column({ type: 'jsonb', nullable: true })
  dados_novos: any;

  @CreateDateColumn()
  data_acao: Date;
}
