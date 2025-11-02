import { Injectable } from '@nestjs/common';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { TipoEntidade } from '../auditoria/entities/auditoria-log.entity';
import { Usuario } from '../usuario/entity/usuario.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async findAll() {
    const clientes = await this.clienteRepository.find({
      relations: [
        'endereco',
        'processos',
        'processos.status',
        'processos.beneficio',
        'processos.tipo_agendamento',
        'processos.colaborador',
        'processos.arquivo_documentos',
      ],
    });

    // Transformar a resposta para incluir apenas id, nome e cargo do colaborador
    return clientes.map((cliente) => ({
      ...cliente,
      processos: cliente.processos.map((processo) => ({
        ...processo,
        colaborador: processo.colaborador
          ? {
              id: processo.colaborador.id,
              nome: processo.colaborador.nome,
              cargo: processo.colaborador.cargo,
            }
          : null,
      })),
    }));
  }

  async findOne(id: number) {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: [
        'endereco',
        'processos',
        'processos.status',
        'processos.beneficio',
        'processos.tipo_agendamento',
        'processos.colaborador',
        'processos.arquivo_documentos',
      ],
    });

    if (!cliente) {
      return null;
    }

    // Transformar a resposta para incluir apenas id, nome e cargo do colaborador
    return {
      ...cliente,
      processos: cliente.processos.map((processo) => ({
        ...processo,
        colaborador: processo.colaborador
          ? {
              id: processo.colaborador.id,
              nome: processo.colaborador.nome,
              cargo: processo.colaborador.cargo,
            }
          : null,
      })),
    };
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
    usuario?: Usuario,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Buscar dados anteriores para auditoria
    const clienteAnterior = await this.clienteRepository.findOne({
      where: { id },
      relations: ['endereco'],
    });

    if (!clienteAnterior) {
      throw new Error('Cliente não encontrado');
    }

    // Atualizar cliente
    const resultado = await this.clienteRepository.update(id, updateClienteDto);

    // Buscar dados novos após atualização
    const clienteNovo = await this.clienteRepository.findOne({
      where: { id },
      relations: ['endereco'],
    });

    // Registrar auditoria se usuário informado
    if (usuario && clienteNovo) {
      await this.auditoriaService.registrarAtualizacao(
        usuario,
        TipoEntidade.CLIENTE,
        id,
        clienteAnterior,
        clienteNovo,
        `Cliente "${clienteAnterior.nome}" atualizado`,
        ipAddress,
        userAgent,
      );
    }

    return resultado;
  }

  async remove(
    id: number,
    usuario?: Usuario,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Buscar dados para auditoria antes de remover (incluindo processos)
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: [
        'endereco',
        'processos',
        'processos.status',
        'processos.beneficio',
        'processos.colaborador',
        'processos.tipo_agendamento',
      ],
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Registrar auditoria dos processos que serão excluídos junto
    if (usuario && cliente.processos && cliente.processos.length > 0) {
      for (const processo of cliente.processos) {
        await this.auditoriaService.registrarRemocao(
          usuario,
          TipoEntidade.PROCESSO,
          processo.id,
          processo,
          `Processo #${processo.id} removido automaticamente (cliente excluído)`,
          ipAddress,
          userAgent,
        );
      }
    }

    const resultado = await this.clienteRepository.delete(id);

    // Registrar auditoria do cliente
    if (usuario) {
      await this.auditoriaService.registrarRemocao(
        usuario,
        TipoEntidade.CLIENTE,
        id,
        cliente,
        `Cliente "${cliente.nome}" removido${cliente.processos?.length ? ` (${cliente.processos.length} processo(s) excluído(s) automaticamente)` : ''}`,
        ipAddress,
        userAgent,
      );
    }

    return resultado;
  }
}
