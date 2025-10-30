import { IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoAcao, TipoEntidade } from '../entities/auditoria-log.entity';

export class ConsultarAuditoriaDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  usuarioId?: number;

  @IsOptional()
  @IsEnum(TipoAcao)
  acao?: TipoAcao;

  @IsOptional()
  @IsEnum(TipoEntidade)
  entidadeTipo?: TipoEntidade;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  entidadeId?: number;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pagina?: number;
}

export class HistoricoEntidadeDto {
  @IsEnum(TipoEntidade)
  entidadeTipo: TipoEntidade;

  @IsNumber()
  @Type(() => Number)
  entidadeId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number;
}
