import { Controller, Get, Param } from '@nestjs/common';
import { StatusProcessoService } from './status-processo.service';
import { StatusProcesso } from '../processos/entities/status-processo.entity';

@Controller('status-processo')
export class StatusProcessoController {
  constructor(private readonly statusProcessoService: StatusProcessoService) {}

  @Get()
  findAll(): Promise<StatusProcesso[]> {
    return this.statusProcessoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<StatusProcesso> {
    return this.statusProcessoService.findOne(+id);
  }
}
