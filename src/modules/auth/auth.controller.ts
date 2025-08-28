import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dados: { email: string; senha: string }) {
    const usuario = await this.authService.validarUsuario(
      dados.email,
      dados.senha,
    );

    return this.authService.login(usuario);
  }

  @Post('refresh')
  async refresh(@Body() dados: { refresh_token: string }) {
    return this.authService.refreshToken(dados.refresh_token);
  }
}
