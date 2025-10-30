import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ClienteService } from './cliente.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('cliente')
@UseGuards(AuthGuard('jwt'))
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Get()
  findAll() {
    return this.clienteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @Req() request: Request,
  ) {
    const usuario = request['user'];

    return this.clienteService.update(+id, updateClienteDto, usuario);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const usuario = request['user'];

    return this.clienteService.remove(+id, usuario);
  }
}
