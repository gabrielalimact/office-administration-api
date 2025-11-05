import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { Repository } from 'typeorm';
import { UsuarioDto, UsuarioSemSenhaDto } from './dto/usuario.dto';
import { Processo } from '../processos/entities/processo.entity';
import { ArquivoService } from '../arquivo/arquivo.service';
import * as bcrypt from 'bcrypt';
import { Arquivo } from '../arquivo/entities/arquivo.entity';
@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Processo)
    private processosRepository: Repository<Processo>,
    @InjectRepository(Arquivo)
    private arquivoRepository: Repository<Arquivo>,
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

  async atualizarCompleto(id: number, dto: Partial<UsuarioDto>): Promise<any> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['imagem'],
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (dto.senha) {
      dto.senha = await bcrypt.hash(dto.senha, 10);
    }

    await this.usuarioRepository.update(id, dto);

    const usuarioAtualizado = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['imagem'],
    });

    return {
      message: 'Usuário atualizado com sucesso',
      usuario: usuarioAtualizado,
    };
  }

  async deletar(id: number): Promise<void> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    const processosAssociados = await this.processosRepository.count({
      where: { colaborador: { id } },
    });

    if (processosAssociados > 0) {
      throw new Error(
        `Não é possível excluir o usuário "${usuario.nome}" pois ele possui ${processosAssociados} processo(s) associado(s). Para excluir este usuário, primeiro reassine ou remova os processos vinculados a ele.`,
      );
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
}
