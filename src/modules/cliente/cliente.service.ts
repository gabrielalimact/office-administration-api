import { Injectable } from '@nestjs/common';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { TipoEntidade } from '../auditoria/entities/auditoria-log.entity';
import { Usuario } from '../usuario/entity/usuario.entity';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Endereco)
    private readonly enderecosRepository: Repository<Endereco>,
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
        'processos.funcionario',
        'processos.documentos',
      ],
    });

    return clientes.map((cliente) => ({
      ...cliente,
      processos: cliente.processos.map((processo) => ({
        ...processo,
        funcionario: processo.funcionario
          ? {
              id: processo.funcionario.id,
              nome: processo.funcionario.nome,
              cargo: processo.funcionario.cargo,
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
        'processos.funcionario',
        'processos.documentos',
      ],
    });

    if (!cliente) {
      return null;
    }

    return {
      ...cliente,
      processos: cliente.processos.map((processo) => ({
        ...processo,
        funcionario: processo.funcionario
          ? {
              id: processo.funcionario.id,
              nome: processo.funcionario.nome,
              cargo: processo.funcionario.cargo,
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
    const clienteAnterior = await this.clienteRepository.findOne({
      where: { id },
      relations: ['endereco'],
    });

    if (!clienteAnterior) {
      throw new Error('Cliente não encontrado');
    }

    const dadosLimpos = { ...updateClienteDto };

    const dadosEndereco = dadosLimpos.endereco;
    delete dadosLimpos.endereco;

    if (dadosLimpos.data_nascimento === '') {
      dadosLimpos.data_nascimento = null;
    }

    Object.keys(dadosLimpos).forEach((key) => {
      if (dadosLimpos[key] === '' && key !== 'data_nascimento') {
        dadosLimpos[key] = null;
      }
    });

    const resultado = await this.clienteRepository.update(id, dadosLimpos);

    if (dadosEndereco) {
      const enderecoLimpo = {
        logradouro: dadosEndereco.logradouro || '',
        numero: dadosEndereco.numero || '',
        complemento: dadosEndereco.complemento || '',
        bairro: dadosEndereco.bairro || '',
        cidade: dadosEndereco.cidade || '',
        estado: dadosEndereco.estado || '',
        cep: dadosEndereco.cep || '',
      };
      if (clienteAnterior.endereco) {
        await this.enderecosRepository.update(
          clienteAnterior.endereco.id,
          enderecoLimpo,
        );
      } else {
        const novoEndereco = this.enderecosRepository.create(enderecoLimpo);
        const enderecoSalvo = await this.enderecosRepository.save(novoEndereco);

        await this.clienteRepository.update(id, { endereco: enderecoSalvo });
      }
    }

    const clienteNovo = await this.clienteRepository.findOne({
      where: { id },
      relations: ['endereco'],
    });

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
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: [
        'endereco',
        'processos',
        'processos.status',
        'processos.beneficio',
        'processos.funcionario',
        'processos.tipo_agendamento',
      ],
    });

    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

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
