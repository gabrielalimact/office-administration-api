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
    // Total de processos cadastrados
    const totalProcessos = await this.processosRepository.count();

    // Processos arquivados e não arquivados
    const processosArquivados = await this.processosRepository.count({
      where: { arquivado: true },
    });
    const processosAtivos = await this.processosRepository.count({
      where: { arquivado: false },
    });

    // Quantidade de processos por benefício
    const processosPorBeneficio = await this.processosRepository
      .createQueryBuilder('processo')
      .leftJoin('processo.beneficio', 'beneficio')
      .select('beneficio.nome', 'beneficio')
      .addSelect('COUNT(processo.id)', 'quantidade')
      .groupBy('beneficio.id')
      .addGroupBy('beneficio.nome')
      .getRawMany();

    // Total de clientes com processos ativos (não arquivados)
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
      clientesComProcessosAtivos,
    };
  }
}
