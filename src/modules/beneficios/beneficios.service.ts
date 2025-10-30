import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Beneficio } from '../processos/entities/beneficios.entity';

@Injectable()
export class BeneficiosService {
  constructor(
    @InjectRepository(Beneficio)
    private beneficioRepository: Repository<Beneficio>,
  ) {}

  async findAll(): Promise<Beneficio[]> {
    return this.beneficioRepository.find({
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Beneficio> {
    return this.beneficioRepository.findOne({
      where: { id },
    });
  }
}
