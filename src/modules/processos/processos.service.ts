import { Injectable } from '@nestjs/common';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Processo } from './entities/processo.entity';
import { Repository } from 'typeorm';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';

@Injectable()
export class ProcessosService {
  constructor(
    @InjectRepository(Processo)
    private readonly processosRepository: Repository<Processo>,

    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,

    @InjectRepository(Endereco)
    private readonly enderecosRepository: Repository<Endereco>,
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

  findAll() {
    return this.processosRepository.find();
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
