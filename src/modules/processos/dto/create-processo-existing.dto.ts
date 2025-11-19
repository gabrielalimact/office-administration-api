import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateProcessoAgendamentoDto } from './processo-agendamento.dto';

export class CreateProcessoExistingDto {
  @IsInt()
  statusId: number;

  @IsInt()
  beneficioId: number;

  @IsInt()
  funcionarioId: number;

  @IsBoolean()
  olhar_inss: boolean;

  @IsBoolean()
  olhar_pje_creta: boolean;

  @IsString()
  @IsOptional()
  senha_inss?: string;

  @IsString()
  @IsOptional()
  colaborador_responsavel?: string;

  @IsDateString()
  data_cadastro: string;

  @IsDateString()
  @IsOptional()
  data_ultima_atualizacao: string;

  @IsDateString()
  @IsOptional()
  data_protocolo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProcessoAgendamentoDto)
  agendamentos?: CreateProcessoAgendamentoDto[];

  @IsString()
  @IsOptional()
  observacoes?: string;
}
