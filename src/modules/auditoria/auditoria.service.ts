import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AuditoriaLog,
  TipoAcao,
  TipoEntidade,
} from './entities/auditoria-log.entity';
import { Usuario } from '../usuario/entity/usuario.entity';

export interface CriarLogAuditoriaDto {
  usuario: Usuario;
  acao: TipoAcao;
  entidadeTipo: TipoEntidade;
  entidadeId: number;
  descricao?: string;
  dadosAnteriores?: any;
  dadosNovos?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface FiltrosConsultaAuditoria {
  usuarioId?: number;
  acao?: TipoAcao;
  entidadeTipo?: TipoEntidade;
  entidadeId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  limite?: number;
  pagina?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaLog)
    private readonly auditoriaRepository: Repository<AuditoriaLog>,
  ) {}

  async criarLog(dados: CriarLogAuditoriaDto): Promise<AuditoriaLog> {
    const log = this.auditoriaRepository.create({
      usuario: dados.usuario,
      usuario_id: dados.usuario.id,
      acao: dados.acao,
      entidade_tipo: dados.entidadeTipo,
      entidade_id: dados.entidadeId,
      descricao: dados.descricao,
      dados_anteriores: dados.dadosAnteriores,
      dados_novos: dados.dadosNovos,
    });

    return await this.auditoriaRepository.save(log);
  }

  async registrarCriacao(
    usuario: Usuario,
    entidadeTipo: TipoEntidade,
    entidadeId: number,
    dadosNovos: any,
    descricao?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditoriaLog> {
    return this.criarLog({
      usuario,
      acao: TipoAcao.CRIAR,
      entidadeTipo,
      entidadeId,
      descricao: descricao || `${entidadeTipo} criado(a)`,
      dadosNovos,
      ipAddress,
      userAgent,
    });
  }

  async registrarAtualizacao(
    usuario: Usuario,
    entidadeTipo: TipoEntidade,
    entidadeId: number,
    dadosAnteriores: any,
    dadosNovos: any,
    descricao?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditoriaLog> {
    return this.criarLog({
      usuario,
      acao: TipoAcao.ATUALIZAR,
      entidadeTipo,
      entidadeId,
      descricao: descricao || `${entidadeTipo} atualizado(a)`,
      dadosAnteriores,
      dadosNovos,
      ipAddress,
      userAgent,
    });
  }

  async registrarRemocao(
    usuario: Usuario,
    entidadeTipo: TipoEntidade,
    entidadeId: number,
    dadosAnteriores: any,
    descricao?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditoriaLog> {
    return this.criarLog({
      usuario,
      acao: TipoAcao.DELETAR,
      entidadeTipo,
      entidadeId,
      descricao: descricao || `${entidadeTipo} removido(a)`,
      dadosAnteriores,
      ipAddress,
      userAgent,
    });
  }

  async registrarEnvioDocumento(
    usuario: Usuario,
    processoId: number,
    nomeArquivo: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditoriaLog> {
    return this.criarLog({
      usuario,
      acao: TipoAcao.ENVIAR_DOCUMENTO,
      entidadeTipo: TipoEntidade.PROCESSO,
      entidadeId: processoId,
      descricao: `Documento "${nomeArquivo}" enviado para o processo`,
      dadosNovos: { nomeArquivo },
      ipAddress,
      userAgent,
    });
  }

  async consultarLogs(filtros: FiltrosConsultaAuditoria = {}) {
    const query = this.auditoriaRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.usuario', 'usuario')
      .orderBy('log.data_acao', 'DESC');

    if (filtros.usuarioId) {
      query.andWhere('log.usuario_id = :usuarioId', {
        usuarioId: filtros.usuarioId,
      });
    }

    if (filtros.acao) {
      query.andWhere('log.acao = :acao', { acao: filtros.acao });
    }

    if (filtros.entidadeTipo) {
      query.andWhere('log.entidade_tipo = :entidadeTipo', {
        entidadeTipo: filtros.entidadeTipo,
      });
    }

    if (filtros.entidadeId) {
      query.andWhere('log.entidade_id = :entidadeId', {
        entidadeId: filtros.entidadeId,
      });
    }

    if (filtros.dataInicio && filtros.dataFim) {
      query.andWhere('log.data_acao BETWEEN :dataInicio AND :dataFim', {
        dataInicio: filtros.dataInicio,
        dataFim: filtros.dataFim,
      });
    } else if (filtros.dataInicio) {
      query.andWhere('log.data_acao >= :dataInicio', {
        dataInicio: filtros.dataInicio,
      });
    } else if (filtros.dataFim) {
      query.andWhere('log.data_acao <= :dataFim', { dataFim: filtros.dataFim });
    }

    const limite = filtros.limite || 50;
    const pagina = filtros.pagina || 1;
    const offset = (pagina - 1) * limite;

    query.take(limite).skip(offset);

    const [logs, total] = await query.getManyAndCount();

    return {
      logs,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
      limite,
    };
  }

  async obterHistoricoPorEntidade(
    entidadeTipo: TipoEntidade,
    entidadeId: number,
    limite = 20,
  ) {
    return await this.auditoriaRepository.find({
      where: {
        entidade_tipo: entidadeTipo,
        entidade_id: entidadeId,
      },
      relations: ['usuario'],
      order: { data_acao: 'DESC' },
      take: limite,
    });
  }

  async obterResumoAtividades(usuarioId?: number, diasAnteriores = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - diasAnteriores);

    const whereCondition: any = {
      data_acao: Between(dataInicio, new Date()),
    };

    if (usuarioId) {
      whereCondition.usuario_id = usuarioId;
    }

    const query = this.auditoriaRepository
      .createQueryBuilder('log')
      .select('log.acao', 'acao')
      .addSelect('COUNT(*)', 'quantidade')
      .where(whereCondition)
      .groupBy('log.acao');

    if (usuarioId) {
      query.andWhere('log.usuario_id = :usuarioId', { usuarioId });
    }

    return await query.getRawMany();
  }
}
