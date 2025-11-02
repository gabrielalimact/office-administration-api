import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoAgendamento } from '../processos/entities/agendamento.entity';
import { TipoAgendamentoController } from './agendamento.controller';
import { TipoAgendamentoService } from './agendamento.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoAgendamento])],
  controllers: [TipoAgendamentoController],
  providers: [TipoAgendamentoService],
  exports: [TipoAgendamentoService],
})
export class TipoAgendamentoModule {}
