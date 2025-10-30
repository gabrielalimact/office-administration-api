import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { Cliente } from './entities/cliente.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Endereco]), AuditoriaModule],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}
