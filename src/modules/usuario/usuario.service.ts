import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { Repository } from 'typeorm';
import { UsuarioDto, UsuarioSemSenhaDto } from './dto/usuario.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
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
    return this.usuarioRepository.find();
  }

  async buscarPorId(id: number): Promise<UsuarioSemSenhaDto | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  async buscarPorCPF(cpf: string): Promise<UsuarioSemSenhaDto | null> {
    return this.usuarioRepository.findOne({ where: { cpf } });
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

  async deletar(id: number): Promise<void> {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    await this.usuarioRepository.delete(id);
  }
}
