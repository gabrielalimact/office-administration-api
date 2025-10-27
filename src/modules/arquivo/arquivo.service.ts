import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Arquivo } from './entities/arquivo.entity';
import * as fs from 'fs';

@Injectable()
export class ArquivoService {
  constructor(
    @InjectRepository(Arquivo)
    private readonly arquivoRepository: Repository<Arquivo>,
  ) {}

  async salvarArquivo(file: Express.Multer.File): Promise<Arquivo> {
    const arquivo = this.arquivoRepository.create({
      nome_original: file.originalname,
      nome_arquivo: file.filename,
      caminho: file.path,
      tamanho: file.size,
      tipo_mime: file.mimetype,
    });

    return this.arquivoRepository.save(arquivo);
  }

  async buscarPorId(id: number): Promise<Arquivo | null> {
    return this.arquivoRepository.findOne({ where: { id } });
  }

  async deletarArquivo(id: number): Promise<void> {
    const arquivo = await this.buscarPorId(id);
    if (!arquivo) {
      throw new Error('Arquivo não encontrado');
    }

    // Remove o arquivo físico
    if (fs.existsSync(arquivo.caminho)) {
      fs.unlinkSync(arquivo.caminho);
    }

    // Remove o registro do banco
    await this.arquivoRepository.delete(id);
  }

  async listarTodos(): Promise<Arquivo[]> {
    return this.arquivoRepository.find();
  }
}
