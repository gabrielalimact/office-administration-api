import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuario/entity/usuario.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async validarUsuario(cpf: string, senha: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { cpf },
      relations: ['imagem'],
    });

    if (usuario && (await bcrypt.compare(senha, usuario.senha))) {
      return usuario;
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }

  async login(usuario: Usuario) {
    const payload = {
      sub: usuario.id,
      cpf: usuario.cpf,
      nome: usuario.nome,
      cargo: usuario.cargo,
      email: usuario.email,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '1d',
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      cpf: usuario.cpf,
      email: usuario.email,
      cargo: usuario.cargo,
      avatar: usuario.imagem
        ? {
            id: usuario.imagem.id,
            nome_arquivo: usuario.imagem.nome_arquivo,
            url: `/imagens/${usuario.imagem.nome_arquivo}`,
          }
        : null,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const newAccess = this.jwtService.sign(
        {
          sub: payload.sub,
          cpf: payload.cpf,
          nome: payload.nome,
          cargo: payload.cargo,
          email: payload.email,
        },
        {
          expiresIn: '15m',
        },
      );
      return {
        access_token: newAccess,
      };
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirou');
    }
  }
}
