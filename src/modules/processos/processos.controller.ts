import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProcessosService } from './processos.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { CreateProcessoExistingDto } from './dto/create-processo-existing.dto';

@Controller('processos')
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  @Post()
  create(@Body() createProcessoDto: CreateProcessoDto) {
    return this.processosService.create(createProcessoDto);
  }

  @Post('cliente/:clienteId')
  createForExisting(
    @Param('clienteId') clienteId: string,
    @Body() dto: CreateProcessoExistingDto,
  ) {
    return this.processosService.createForExistingClient(+clienteId, dto);
  }

  @Get()
  findAll() {
    return this.processosService.findAll();
  }
  @Get('/status')
  findAllStatus() {
    return this.processosService.findAllStatus();
  }
  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId') clienteId: string) {
    return this.processosService.findByCliente(+clienteId);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProcessoDto: UpdateProcessoDto,
  ) {
    return this.processosService.update(+id, updateProcessoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processosService.remove(+id);
  }
}
