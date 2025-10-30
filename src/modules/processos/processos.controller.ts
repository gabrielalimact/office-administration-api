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
        destination: './documentos-clientes',
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
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
  )
  create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
    // Parse dos dados JSON enviados como multipart/form-data
    const createProcessoDto: CreateProcessoDto = {
      cliente:
        typeof body.cliente === 'string'
          ? JSON.parse(body.cliente)
          : body.cliente,
      colaboradorId: body.colaboradorId
        ? parseInt(body.colaboradorId)
        : undefined,
      beneficio:
        typeof body.beneficio === 'string'
          ? JSON.parse(body.beneficio)
          : body.beneficio,
      olhar_inss:
        body.olhar_inss === 'true' || body.olhar_inss === true || false,
      olhar_pje_creta:
        body.olhar_pje_creta === 'true' ||
        body.olhar_pje_creta === true ||
        false,
      senha_inss: body.senha_inss || undefined,
      data_atendimento: body.data_atendimento || undefined,
      data_ultima_atualizacao: body.data_ultima_atualizacao || undefined,
      status:
        typeof body.status === 'string' ? JSON.parse(body.status) : body.status,
      observacoes: body.observacoes || undefined,
    };

    return this.processosService.create(createProcessoDto, file);
  }

  @Post('cliente/:clienteId')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: './documentos-clientes',
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
        fileSize: 100 * 1024 * 1024, // 100MB
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
        destination: './documentos-clientes',
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
        fileSize: 100 * 1024 * 1024, // 100MB
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
