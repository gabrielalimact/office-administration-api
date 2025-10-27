import { Injectable } from '@nestjs/common';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Processo } from './entities/processo.entity';
import { Repository } from 'typeorm';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { StatusProcesso } from './entities/status-processo.entity';
import { Beneficio } from './entities/beneficios.entity';
import { CreateProcessoExistingDto } from './dto/create-processo-existing.dto';

@Injectable()
export class ProcessosService {
  constructor(
    @InjectRepository(Processo)
    private readonly processosRepository: Repository<Processo>,

    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,

    @InjectRepository(Endereco)
    private readonly enderecosRepository: Repository<Endereco>,

    @InjectRepository(StatusProcesso)
    private readonly statusProcessoRepository: Repository<StatusProcesso>,

    @InjectRepository(Beneficio)
    private readonly beneficioRepository: Repository<Beneficio>,
  ) {}
  async create(createProcessoDto: CreateProcessoDto) {
    const endereco = this.enderecosRepository.create(
      createProcessoDto.cliente.endereco,
    );
    await this.enderecosRepository.save(endereco);

    const cliente = this.clientesRepository.create({
      ...createProcessoDto.cliente,
      endereco,
    });
    await this.clientesRepository.save(cliente);

    const processo = this.processosRepository.create({
      cliente,
      ...createProcessoDto,
    });
    await this.processosRepository.save(processo);
  }

  async createForExistingClient(
    clienteId: number,
    dto: CreateProcessoExistingDto,
  ) {
    const cliente = await this.clientesRepository.findOne({
      where: { id: clienteId },
      relations: ['endereco'],
    });
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    const status = await this.statusProcessoRepository.findOne({
      where: { id: dto.statusId },
    });
    if (!status) throw new Error('Status inválido');

    const beneficio = await this.beneficioRepository.findOne({
      where: { id: dto.beneficioId },
    });
    if (!beneficio) throw new Error('Benefício inválido');

    const processo = this.processosRepository.create({
      ...dto,
      data_ultima_atualizacao:
        dto.data_ultima_atualizacao || new Date().toISOString().split('T')[0],
      cliente: { id: clienteId },
      status,
      beneficio,
    });

    return this.processosRepository.save(processo);
  }
  findAll() {
    return this.processosRepository.find({
      relations: ['cliente', 'status', 'beneficio'],
    });
  }

  async findByCliente(clienteId: number) {
    return this.processosRepository.find({
      where: { cliente: { id: clienteId } },
      relations: ['cliente', 'status', 'beneficio', 'cliente.endereco'],
    });
  }
  findAllStatus() {
    return this.statusProcessoRepository.find().catch((e) => {
      console.error('Erro ao buscar status:', e);
      throw e;
    });
  }

  findOne(id: number) {
    return this.processosRepository.findOne({ where: { id } });
  }

  update(id: number, updateProcessoDto: UpdateProcessoDto) {
    const processo = this.processosRepository.create({
      id,
      ...updateProcessoDto,
    });
    return this.processosRepository.save(processo);
  }

  remove(id: number) {
    return this.processosRepository.delete(id);
  }
}
