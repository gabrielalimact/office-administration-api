import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProcessoExistingDto {
  @IsInt()
  statusId: number;

  @IsOptional()
  @IsInt()
  tipoAgendamentoId?: number;

  @IsInt()
  beneficioId: number;

  @IsInt()
  colaboradorId: number;

  @IsBoolean()
  olhar_inss: boolean;

  @IsBoolean()
  olhar_pje_creta: boolean;

  @IsString()
  @IsOptional()
  senha_inss?: string;

  @IsDateString()
  data_cadastro: string;

  @IsDateString()
  @IsOptional()
  data_ultima_atualizacao: string;

  @IsDateString()
  @IsOptional()
  data_agendamento: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
