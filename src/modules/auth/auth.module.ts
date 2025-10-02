import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Usuario } from '../usuario/entity/usuario.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtStrategy } from './jwt/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'segredo_super_secreto',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, UsuarioService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
