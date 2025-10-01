import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authDto: AuthDto) {
    const usuario = await this.authService.validarUsuario(
      authDto.cpf,
      authDto.senha,
    );

    return this.authService.login(usuario);
  }

  @Post('refresh')
  async refresh(@Body() dados: { refresh_token: string }) {
    return this.authService.refreshToken(dados.refresh_token);
  }
}
