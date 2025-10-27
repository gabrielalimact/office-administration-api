import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArquivoService } from './arquivo.service';

@Controller('arquivo')
export class ArquivoController {
  constructor(private readonly arquivoService: ArquivoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.arquivoService.salvarArquivo(file);
  }

  @Get()
  async listarTodos() {
    return this.arquivoService.listarTodos();
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string) {
    return this.arquivoService.buscarPorId(+id);
  }

  @Delete(':id')
  async deletar(@Param('id') id: string) {
    await this.arquivoService.deletarArquivo(+id);
    return { message: 'Arquivo deletado com sucesso' };
  }
}
