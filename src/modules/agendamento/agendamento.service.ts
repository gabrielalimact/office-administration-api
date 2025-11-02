import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoAgendamento } from '../processos/entities/agendamento.entity';

@Injectable()
export class TipoAgendamentoService {
  constructor(
    @InjectRepository(TipoAgendamento)
    private tipoAgendamentoRepository: Repository<TipoAgendamento>,
  ) {}

  async findAll(): Promise<TipoAgendamento[]> {
    return this.tipoAgendamentoRepository.find({
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TipoAgendamento> {
    return this.tipoAgendamentoRepository.findOne({
      where: { id },
    });
  }
}
