import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProcessosService } from './processos.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { CreateProcessoExistingDto } from './dto/create-processo-existing.dto';

@Controller('processos')
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: './imagens',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temp-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed',
          'application/vnd.rar',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar')
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  create(
    @Body() createProcessoDto: CreateProcessoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.processosService.create(createProcessoDto, file);
  }

  @Post('cliente/:clienteId')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: './imagens',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temp-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed',
          'application/vnd.rar',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar')
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  createForExisting(
    @Param('clienteId') clienteId: string,
    @Body() dto: CreateProcessoExistingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.processosService.createForExistingClient(+clienteId, dto, file);
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

  @Post(':id/documentos')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: './imagens',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `temp-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/zip',
          'application/x-zip-compressed',
          'application/x-rar-compressed',
          'application/vnd.rar',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar')
        ) {
          callback(null, true);
        } else {
          callback(
            new Error('Apenas arquivos ZIP e RAR são permitidos'),
            false,
          );
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  )
  uploadDocumentos(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }
    return this.processosService.uploadDocumentos(+id, file);
  }
}
