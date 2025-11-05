import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { Processo } from '../processos/entities/processo.entity';
import { ArquivoModule } from '../arquivo/arquivo.module';
import { Arquivo } from '../arquivo/entities/arquivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Processo, Arquivo]),
    ArquivoModule,
  ],
  providers: [UsuarioService],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule {}
