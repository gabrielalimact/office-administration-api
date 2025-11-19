import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProcessoAgendamentoDto {
  @IsNumber()
  @IsNotEmpty()
  tipo_agendamento_id: number;

  @IsDateString()
  @IsNotEmpty()
  data_agendamento: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  concluido?: boolean;
}

export class UpdateProcessoAgendamentoDto {
  @IsOptional()
  @IsNumber()
  tipo_agendamento_id?: number;

  @IsOptional()
  @IsDateString()
  data_agendamento?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsBoolean()
  concluido?: boolean;
}
