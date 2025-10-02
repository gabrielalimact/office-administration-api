import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDto, UsuarioSemSenhaDto } from './dto/usuario.dto';
import { AuthGuard } from '@nestjs/passport';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  criar(@Body() dto: UsuarioDto): Promise<void> {
    return this.usuarioService.criar(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  listar(): Promise<UsuarioSemSenhaDto[]> {
    return this.usuarioService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string): Promise<UsuarioSemSenhaDto> {
    return this.usuarioService.buscarPorId(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UsuarioDto>) {
    return this.usuarioService.atualizar(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usuarioService.deletar(+id);
  }
}
