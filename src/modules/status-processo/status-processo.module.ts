import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusProcessoController } from './status-processo.controller';
import { StatusProcessoService } from './status-processo.service';
import { StatusProcesso } from '../processos/entities/status-processo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StatusProcesso])],
  controllers: [StatusProcessoController],
  providers: [StatusProcessoService],
  exports: [StatusProcessoService],
})
export class StatusProcessoModule {}
