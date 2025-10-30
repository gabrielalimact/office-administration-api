import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditoriaService } from './auditoria.service';
import { ConsultarAuditoriaDto } from './dto/consultar-auditoria.dto';
import { TipoEntidade } from './entities/auditoria-log.entity';

@Controller('auditoria')
@UseGuards(AuthGuard('jwt'))
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('logs')
  async consultarLogs(@Query() filtros: ConsultarAuditoriaDto) {
    const filtrosProcessados = {
      ...filtros,
      dataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      dataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
    };

    return await this.auditoriaService.consultarLogs(filtrosProcessados);
  }

  @Get('historico/:entidadeTipo/:entidadeId')
  async obterHistoricoPorEntidade(
    @Param('entidadeTipo') entidadeTipo: TipoEntidade,
    @Param('entidadeId') entidadeId: number,
    @Query('limite') limite?: number,
  ) {
    return await this.auditoriaService.obterHistoricoPorEntidade(
      entidadeTipo,
      Number(entidadeId),
      limite ? Number(limite) : 20,
    );
  }

  @Get('resumo/:usuarioId')
  async obterResumoAtividades(
    @Param('usuarioId') usuarioId?: number,
    @Query('diasAnteriores') diasAnteriores?: number,
  ) {
    return await this.auditoriaService.obterResumoAtividades(
      usuarioId ? Number(usuarioId) : undefined,
      diasAnteriores ? Number(diasAnteriores) : 30,
    );
  }

  @Get('funcionario/:usuarioId')
  async obterLogsPorFuncionario(
    @Param('usuarioId') usuarioId: number,
    @Query() filtros: Omit<ConsultarAuditoriaDto, 'usuarioId'>,
  ) {
    const filtrosProcessados = {
      ...filtros,
      usuarioId: Number(usuarioId),
      dataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      dataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
    };

    return await this.auditoriaService.consultarLogs(filtrosProcessados);
  }
}
