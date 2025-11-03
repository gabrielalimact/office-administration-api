import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Processo } from '../processos/entities/processo.entity';
import { Cliente } from '../cliente/entities/cliente.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Processo)
    private readonly processosRepository: Repository<Processo>,

    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
  ) {}

  async getDashboardStats() {
    const totalProcessos = await this.processosRepository.count();
    const processosArquivados = await this.processosRepository.count({
      where: { arquivado: true },
    });
    const processosAtivos = await this.processosRepository.count({
      where: { arquivado: false },
    });

    const processosPorBeneficio = await this.processosRepository
      .createQueryBuilder('processo')
      .leftJoin('processo.beneficio', 'beneficio')
      .select('beneficio.nome', 'beneficio')
      .addSelect('COUNT(processo.id)', 'quantidade')
      .groupBy('beneficio.id')
      .addGroupBy('beneficio.nome')
      .getRawMany();

    const processosPorTipoAgendamento = await this.processosRepository
      .createQueryBuilder('processo')
      .leftJoin('processo.tipo_agendamento', 'tipo_agendamento')
      .select(
        "COALESCE(tipo_agendamento.nome, 'Sem tipo definido')",
        'tipo_agendamento',
      )
      .addSelect('COUNT(processo.id)', 'quantidade')
      .where('processo.arquivado = :arquivado', { arquivado: false })
      .groupBy('tipo_agendamento.id')
      .addGroupBy('tipo_agendamento.nome')
      .getRawMany();

    const clientesComProcessosAtivosResult = await this.clientesRepository
      .createQueryBuilder('cliente')
      .innerJoin('cliente.processos', 'processo')
      .where('processo.arquivado = :arquivado', { arquivado: false })
      .select('COUNT(DISTINCT cliente.id)', 'count')
      .getRawOne();

    const clientesComProcessosAtivos = parseInt(
      clientesComProcessosAtivosResult.count,
      10,
    );

    return {
      totalProcessos,
      processosArquivados,
      processosAtivos,
      processosPorBeneficio: processosPorBeneficio.map((item) => ({
        beneficio: item.beneficio,
        quantidade: parseInt(item.quantidade, 10),
      })),
      processosPorTipoAgendamento: processosPorTipoAgendamento.map((item) => ({
        tipo_agendamento: item.tipo_agendamento,
        quantidade: parseInt(item.quantidade, 10),
      })),
      clientesComProcessosAtivos,
    };
  }
}
