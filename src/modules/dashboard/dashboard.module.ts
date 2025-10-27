import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Processo } from '../processos/entities/processo.entity';
import { Cliente } from '../cliente/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Processo, Cliente])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
