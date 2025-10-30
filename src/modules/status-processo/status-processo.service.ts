import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusProcesso } from '../processos/entities/status-processo.entity';

@Injectable()
export class StatusProcessoService {
  constructor(
    @InjectRepository(StatusProcesso)
    private statusProcessoRepository: Repository<StatusProcesso>,
  ) {}

  async findAll(): Promise<StatusProcesso[]> {
    return this.statusProcessoRepository.find({
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<StatusProcesso> {
    return this.statusProcessoRepository.findOne({
      where: { id },
    });
  }
}
