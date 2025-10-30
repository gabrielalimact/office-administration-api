import { Module } from '@nestjs/common';
import { ProcessosService } from './processos.service';
import { ProcessosController } from './processos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Processo } from './entities/processo.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { StatusProcesso } from './entities/status-processo.entity';
import { Beneficio } from './entities/beneficios.entity';
import { ArquivoModule } from '../arquivo/arquivo.module';
import { Usuario } from '../usuario/entity/usuario.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Processo,
      Cliente,
      Endereco,
      StatusProcesso,
      Beneficio,
      Usuario,
    ]),
    ArquivoModule,
    AuditoriaModule,
  ],
  controllers: [ProcessosController],
  providers: [ProcessosService],
})
export class ProcessosModule {}
