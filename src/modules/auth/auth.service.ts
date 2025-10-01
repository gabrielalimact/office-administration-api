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
    const usuario = await this.usuarioRepository.findOne({ where: { cpf } });

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
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: 'segredo_super_secreto',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: 'segredo_refresh_super_secreto',
      expiresIn: '7d',
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      cpf: usuario.cpf,
      cargo: usuario.cargo,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: 'chave-secreta-refresh-token',
      });
      return {
        access_token: this.jwtService.sign(
          { sub: payload.sub, email: payload.email },
          { secret: 'chave-secreta-token', expiresIn: '15m' },
        ),
      };
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirou');
    }
  }
}
