import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { CreateRelatorioDto } from './dto/create-relatorio.dto';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Post()
  criar(@Body() dto: CreateRelatorioDto) {
    return this.relatoriosService.criar(dto);
  }

  @Get('funcionario/:id')
  listarPorFuncionario(@Param('id', ParseIntPipe) id: number) {
    return this.relatoriosService.listarPorFuncionario(id);
  }

  @Get()
  listarTodos() {
    return this.relatoriosService.listarTodos();
  }
}
