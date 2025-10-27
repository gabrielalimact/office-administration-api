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
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('com-imagem')
  @UseInterceptors(
    FileInterceptor('imagem', {
      dest: './imagens',
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async criarComImagem(
    @Body() dto: UsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usuarioService.criarComImagem(dto, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  listar(): Promise<UsuarioSemSenhaDto[]> {
    return this.usuarioService.listar();
  }

  @Get('funcionarios/processos')
  listarFuncionariosComProcessos() {
    return this.usuarioService.listarFuncionariosComProcessos();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string): Promise<UsuarioSemSenhaDto> {
    return this.usuarioService.buscarPorId(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UsuarioDto>) {
    return this.usuarioService.atualizar(+id, dto);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('imagem', {
      dest: './imagens',
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async atualizarCompleto(
    @Param('id') id: string,
    @Body() dto: Partial<UsuarioDto>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usuarioService.atualizarCompleto(+id, dto, file);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usuarioService.deletar(+id);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      dest: './imagens',
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usuarioService.uploadAvatar(+id, file);
  }
}
