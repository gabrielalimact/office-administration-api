import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relatorio } from './entities/relatorios.entity';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { Usuario } from '../usuario/entity/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Relatorio, Usuario])],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
  exports: [RelatoriosService],
})
export class RelatoriosModule {}
