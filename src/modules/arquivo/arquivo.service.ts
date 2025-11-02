import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Response } from 'express';
import { Arquivo } from './entities/arquivo.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArquivoService {
  constructor(
    @InjectRepository(Arquivo)
    private readonly arquivoRepository: Repository<Arquivo>,
  ) {}

  async salvarArquivo(
    file: Express.Multer.File,
    nomePersonalizado?: string,
    manager?: EntityManager,
    isAvatar?: boolean,
  ): Promise<Arquivo> {
    const baseDir = isAvatar ? './imagens' : './documentos-clientes';

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '';
    const nomeArquivoFinal =
      nomePersonalizado ||
      `${isAvatar ? 'avatar' : 'documento'}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const novoCaminho = path.join(baseDir, nomeArquivoFinal);

    try {
      fs.renameSync(file.path, novoCaminho);
    } catch (error) {
      console.error('Erro ao mover arquivo:', error);
      throw new Error(`Erro ao processar arquivo: ${error.message}`);
    }

    const arquivo = {
      nome_original: file.originalname,
      nome_arquivo: nomeArquivoFinal,
      caminho: novoCaminho,
      tamanho: file.size,
      tipo_mime: file.mimetype,
    };

    if (manager) {
      return manager.save(Arquivo, manager.create(Arquivo, arquivo));
    }

    return this.arquivoRepository.save(this.arquivoRepository.create(arquivo));
  }

  async buscarPorId(id: number): Promise<Arquivo | null> {
    return this.arquivoRepository.findOne({ where: { id } });
  }

  async deletarArquivo(id: number): Promise<void> {
    const arquivo = await this.buscarPorId(id);
    if (!arquivo) throw new Error('Arquivo não encontrado');

    if (fs.existsSync(arquivo.caminho)) {
      fs.unlinkSync(arquivo.caminho);
    }

    await this.arquivoRepository.delete(id);
  }

  async listarTodos(): Promise<Arquivo[]> {
    return this.arquivoRepository.find();
  }

  async downloadArquivo(id: number, res: Response): Promise<void> {
    const arquivo = await this.buscarPorId(id);
    if (!arquivo) throw new Error('Arquivo não encontrado');
    if (!fs.existsSync(arquivo.caminho))
      throw new Error('Arquivo físico não encontrado');

    const nomeDownload = arquivo.nome_original || arquivo.nome_arquivo;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nomeDownload}"`,
    );
    res.setHeader('Content-Type', arquivo.tipo_mime);
    res.setHeader('Content-Length', arquivo.tamanho);

    const stream = fs.createReadStream(arquivo.caminho);
    stream.pipe(res);
  }
}
