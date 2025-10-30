import { Injectable } from '@nestjs/common';
import { AuditoriaService } from '../auditoria/auditoria.service';
import {
  TipoEntidade,
  TipoAcao,
} from '../auditoria/entities/auditoria-log.entity';
import { Usuario } from '../usuario/entity/usuario.entity';

/**
 * Exemplo de como usar o sistema de auditoria nos seus controllers
 */
@Injectable()
export class ExemploUsoAuditoria {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /**
   * Exemplo: Como registrar uma ação customizada
   */
  async exemploAcaoCustomizada(usuario: Usuario, clienteId: number) {
    await this.auditoriaService.criarLog({
      usuario,
      acao: TipoAcao.ATUALIZAR,
      entidadeTipo: TipoEntidade.CLIENTE,
      entidadeId: clienteId,
      descricao: 'Cliente marcado como VIP',
      dadosNovos: { status: 'VIP' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
    });
  }

  /**
   * Exemplo: Como obter histórico de uma entidade
   */
  async exemploConsultarHistorico() {
    // Ver últimas 10 mudanças do cliente ID 123
    const historico = await this.auditoriaService.obterHistoricoPorEntidade(
      TipoEntidade.CLIENTE,
      123,
      10,
    );

    console.log('Histórico do cliente:', historico);
  }

  /**
   * Exemplo: Como fazer relatório de atividades
   */
  async exemploRelatorioAtividades() {
    // Atividades dos últimos 30 dias
    const relatorio = await this.auditoriaService.consultarLogs({
      dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dataFim: new Date(),
      limite: 100,
    });

    console.log(`Total de ações: ${relatorio.total}`);
    console.log('Ações por página:', relatorio.logs.length);
  }
}
