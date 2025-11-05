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
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProcessosService } from './processos.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { CreateProcessoExistingDto } from './dto/create-processo-existing.dto';

@Controller('processos')
@UseGuards(AuthGuard('jwt'))
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
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar') ||
          file.originalname.toLowerCase().endsWith('.pdf') ||
          file.originalname.toLowerCase().endsWith('.jpg') ||
          file.originalname.toLowerCase().endsWith('.jpeg') ||
          file.originalname.toLowerCase().endsWith('.png') ||
          file.originalname.toLowerCase().endsWith('.gif') ||
          file.originalname.toLowerCase().endsWith('.webp')
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
  create(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
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
      data_cadastro: body.data_cadastro || undefined,
      data_agendamento: body.data_agendamento || undefined,
      data_ultima_atualizacao: body.data_ultima_atualizacao || undefined,
      status:
        typeof body.status === 'string' ? JSON.parse(body.status) : body.status,
      tipo_agendamento:
        typeof body.tipo_agendamento === 'string'
          ? JSON.parse(body.tipo_agendamento)
          : body.tipo_agendamento,
      observacoes: body.observacoes || undefined,
    };

    const usuario = request['user'];

    return this.processosService.create(createProcessoDto, file, usuario);
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
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar') ||
          file.originalname.toLowerCase().endsWith('.pdf') ||
          file.originalname.toLowerCase().endsWith('.jpg') ||
          file.originalname.toLowerCase().endsWith('.jpeg') ||
          file.originalname.toLowerCase().endsWith('.png') ||
          file.originalname.toLowerCase().endsWith('.gif') ||
          file.originalname.toLowerCase().endsWith('.webp')
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
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar') ||
          file.originalname.toLowerCase().endsWith('.pdf') ||
          file.originalname.toLowerCase().endsWith('.jpg') ||
          file.originalname.toLowerCase().endsWith('.jpeg') ||
          file.originalname.toLowerCase().endsWith('.png') ||
          file.originalname.toLowerCase().endsWith('.gif') ||
          file.originalname.toLowerCase().endsWith('.webp')
        ) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updateProcessoDto: UpdateProcessoDto = {
      colaboradorId: body.colaboradorId
        ? parseInt(body.colaboradorId)
        : undefined,
      beneficio:
        typeof body.beneficio === 'string'
          ? JSON.parse(body.beneficio)
          : body.beneficio,
      olhar_inss: body.olhar_inss === 'true' || body.olhar_inss === true,
      olhar_pje_creta:
        body.olhar_pje_creta === 'true' || body.olhar_pje_creta === true,
      senha_inss: body.senha_inss || undefined,
      data_cadastro: body.data_cadastro || undefined,
      data_agendamento: body.data_agendamento || undefined,
      data_ultima_atualizacao: body.data_ultima_atualizacao || undefined,
      status:
        typeof body.status === 'string' ? JSON.parse(body.status) : body.status,
      tipo_agendamento:
        typeof body.tipo_agendamento === 'string'
          ? JSON.parse(body.tipo_agendamento)
          : body.tipo_agendamento,
      observacoes: body.observacoes || undefined,
    };

    return this.processosService.update(+id, updateProcessoDto, file);
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
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
        ];

        if (
          allowedMimes.includes(file.mimetype) ||
          file.originalname.toLowerCase().endsWith('.zip') ||
          file.originalname.toLowerCase().endsWith('.rar') ||
          file.originalname.toLowerCase().endsWith('.pdf') ||
          file.originalname.toLowerCase().endsWith('.jpg') ||
          file.originalname.toLowerCase().endsWith('.jpeg') ||
          file.originalname.toLowerCase().endsWith('.png') ||
          file.originalname.toLowerCase().endsWith('.gif') ||
          file.originalname.toLowerCase().endsWith('.webp')
        ) {
          callback(null, true);
        } else {
          callback(
            new Error('Apenas arquivos ZIP, RAR, PDF e imagens são permitidos'),
            false,
          );
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  uploadDocumentos(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('🔥 ENTROU NA ROTA /documentos');
    console.log('📁 File recebido:', file);

    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }
    return this.processosService.uploadDocumentos(+id, file);
  }

  @Get(':id/documentos')
  async listarDocumentos(@Param('id') id: string) {
    return this.processosService.listarDocumentosProcesso(+id);
  }

  @Delete(':id/documentos/:documentoId')
  async removerDocumento(
    @Param('id') id: string,
    @Param('documentoId') documentoId: string,
  ) {
    return this.processosService.removerDocumento(+id, +documentoId);
  }
}
