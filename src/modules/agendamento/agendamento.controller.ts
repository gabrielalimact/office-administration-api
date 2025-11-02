import { Controller, Get, Param } from '@nestjs/common';
import { TipoAgendamento } from '../processos/entities/agendamento.entity';
import { TipoAgendamentoService } from './agendamento.service';

@Controller('tipo-agendamento')
export class TipoAgendamentoController {
  constructor(
    private readonly tipoAgendamentoService: TipoAgendamentoService,
  ) {}

  @Get()
  findAll(): Promise<TipoAgendamento[]> {
    return this.tipoAgendamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TipoAgendamento> {
    return this.tipoAgendamentoService.findOne(+id);
  }
}
