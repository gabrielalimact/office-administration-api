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
    console.log('Dados do arquivo recebido:', {
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Gera nome do arquivo com extensão se não tem extensão
    let nomeArquivo = file.filename;
    let caminhoArquivo = file.path;

    if (!nomeArquivo || !nomeArquivo.includes('.')) {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      const novoNome = `avatar-${timestamp}-${random}.${ext}`;
      const novoCaminho = `./imagens/${novoNome}`;

      // Move o arquivo para o novo nome se necessário
      if (file.path && file.path !== novoCaminho) {
        fs.renameSync(file.path, novoCaminho);
        nomeArquivo = novoNome;
        caminhoArquivo = novoCaminho;
      } else {
        nomeArquivo = novoNome;
        caminhoArquivo = novoCaminho;
      }
    }

    const arquivo = this.arquivoRepository.create({
      nome_original: file.originalname,
      nome_arquivo: nomeArquivo,
      caminho: caminhoArquivo,
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
