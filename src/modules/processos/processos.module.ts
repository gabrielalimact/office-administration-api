import { Module } from '@nestjs/common';
import { ProcessosService } from './processos.service';
import { ProcessosController } from './processos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Processo } from './entities/processo.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Processo, Cliente, Endereco])],
  controllers: [ProcessosController],
  providers: [ProcessosService],
})
export class ProcessosModule {}
