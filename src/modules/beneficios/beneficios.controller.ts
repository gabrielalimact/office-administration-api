import { Controller, Get, Param } from '@nestjs/common';
import { BeneficiosService } from './beneficios.service';
import { Beneficio } from '../processos/entities/beneficios.entity';

@Controller('beneficios')
export class BeneficiosController {
  constructor(private readonly beneficiosService: BeneficiosService) {}

  @Get()
  findAll(): Promise<Beneficio[]> {
    return this.beneficiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Beneficio> {
    return this.beneficiosService.findOne(+id);
  }
}
