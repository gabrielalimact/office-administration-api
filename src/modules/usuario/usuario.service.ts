import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { Repository } from 'typeorm';
import { UsuarioDto, UsuarioSemSenhaDto } from './dto/usuario.dto';
import { Processo } from '../processos/entities/processo.entity';
import { ArquivoService } from '../arquivo/arquivo.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Processo)
    private processosRepository: Repository<Processo>,
    private arquivoService: ArquivoService,
  ) {}

  async criar(dto: UsuarioDto): Promise<void> {
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuarioRepository.create({
      ...dto,
      senha: senhaHash,
    });
    await this.usuarioRepository.save(usuario);
  }

  async criarComImagem(
    dto: UsuarioDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    let id_imagem: number | undefined;

    // Se há um arquivo, salva primeiro
    if (file) {
      const arquivo = await this.arquivoService.salvarArquivo(file);
      id_imagem = arquivo.id;
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuarioRepository.create({
      ...dto,
      senha: senhaHash,
      id_imagem,
    });

    const usuarioCriado = await this.usuarioRepository.save(usuario);

    return {
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuarioCriado.id,
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        cpf: usuarioCriado.cpf,
        cargo: usuarioCriado.cargo,
        id_imagem: usuarioCriado.id_imagem,
      },
    };
  }

  async listar(): Promise<UsuarioSemSenhaDto[]> {
    return this.usuarioRepository.find({
      relations: ['imagem'],
    });
  }

  async buscarPorId(id: number): Promise<UsuarioSemSenhaDto | null> {
    return this.usuarioRepository.findOne({
      where: { id },
      relations: ['imagem'],
    });
  }

  async buscarPorCPF(cpf: string): Promise<UsuarioSemSenhaDto | null> {
    return this.usuarioRepository.findOne({
      where: { cpf },
      relations: ['imagem'],
    });
  }

  async atualizar(id: number, dto: Partial<UsuarioDto>): Promise<void> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (dto.senha) {
      dto.senha = await bcrypt.hash(dto.senha, 10);
    }
    Object.assign(usuario, dto);
    await this.usuarioRepository.update(id, usuario);
  }

  async atualizarCompleto(
    id: number,
    dto: Partial<UsuarioDto>,
    file?: Express.Multer.File,
  ): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['imagem'],
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    let novoArquivo = null;

    // Se há um arquivo, processa o upload
    if (file) {
      // Remove o arquivo anterior se existir
      if (usuario.id_imagem) {
        await this.arquivoService.deletarArquivo(usuario.id_imagem);
      }

      // Salva o novo arquivo
      novoArquivo = await this.arquivoService.salvarArquivo(file);
      dto.id_imagem = novoArquivo.id;
    }

    // Hash da senha se fornecida
    if (dto.senha) {
      dto.senha = await bcrypt.hash(dto.senha, 10);
    }

    // Atualiza o usuário
    await this.usuarioRepository.update(id, dto);

    // Busca o usuário atualizado com relações
    const usuarioAtualizado = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['imagem'],
    });

    return {
      message: 'Usuário atualizado com sucesso',
      usuario: usuarioAtualizado,
      arquivo: novoArquivo,
    };
  }

  async deletar(id: number): Promise<void> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    await this.usuarioRepository.delete(id);
  }

  async listarFuncionariosComProcessos() {
    const funcionarios = await this.usuarioRepository.find();

    const funcionariosComProcessos = await Promise.all(
      funcionarios.map(async (funcionario) => {
        const processos = await this.processosRepository.find({
          where: { colaborador: funcionario.nome },
          relations: ['cliente', 'status', 'beneficio'],
        });

        return {
          ...funcionario,
          processos,
          totalProcessos: processos.length,
        };
      }),
    );

    return funcionariosComProcessos;
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['imagem'],
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Remove o arquivo anterior se existir
    if (usuario.id_imagem) {
      await this.arquivoService.deletarArquivo(usuario.id_imagem);
    }

    // Salva o novo arquivo
    const novoArquivo = await this.arquivoService.salvarArquivo(file);

    // Atualiza o usuário com o novo arquivo
    await this.usuarioRepository.update(id, { id_imagem: novoArquivo.id });

    return {
      message: 'Avatar atualizado com sucesso',
      arquivo: novoArquivo,
    };
  }
}
