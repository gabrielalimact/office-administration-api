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

    if (file) {
      const arquivo = await this.arquivoService.salvarArquivo(
        file,
        undefined,
        undefined,
        true,
      );
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
    let idImagemAnterior = null;

    if (file) {
      if (usuario.id_imagem) {
        idImagemAnterior = usuario.id_imagem;
      }

      novoArquivo = await this.arquivoService.salvarArquivo(
        file,
        undefined,
        undefined,
        true,
      );
      dto.id_imagem = novoArquivo.id;
    }

    if (dto.senha) {
      dto.senha = await bcrypt.hash(dto.senha, 10);
    }

    await this.usuarioRepository.update(id, dto);

    if (idImagemAnterior && novoArquivo) {
      try {
        await this.arquivoService.deletarArquivo(idImagemAnterior);
      } catch (error) {
        console.warn('Erro ao deletar arquivo anterior:', error.message);
      }
    }

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
          where: { colaborador: { id: funcionario.id } },
          relations: ['cliente', 'status', 'beneficio', 'colaborador'],
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

    const idImagemAnterior = usuario.id_imagem;

    const novoArquivo = await this.arquivoService.salvarArquivo(
      file,
      undefined,
      undefined,
      true,
    );

    await this.usuarioRepository.update(id, { id_imagem: novoArquivo.id });

    if (idImagemAnterior) {
      try {
        await this.arquivoService.deletarArquivo(idImagemAnterior);
      } catch (error) {
        console.warn('Erro ao deletar arquivo anterior:', error.message);
      }
    }

    return {
      message: 'Avatar atualizado com sucesso',
      arquivo: novoArquivo,
    };
  }
}
