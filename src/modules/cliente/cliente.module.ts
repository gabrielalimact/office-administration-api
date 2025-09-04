import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { Cliente } from './entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Endereco])],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}
