import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { CreateClienteDto } from '../../cliente/dto/create-cliente.dto';
import { StatusProcesso } from '../entities/status-processo.entity';
import { Beneficio } from '../entities/beneficios.entity';
import { TipoAgendamento } from '../entities/agendamento.entity';

export class CreateProcessoDto {
  @ValidateNested()
  @Type(() => CreateClienteDto)
  @IsNotEmpty()
  cliente: CreateClienteDto;

  @IsOptional()
  @IsNumber()
  funcionarioId?: number;

  @IsOptional()
  @IsString()
  colaborador_responsavel?: string;

  @Type(() => Beneficio)
  @IsNotEmpty()
  beneficio: Beneficio;

  @IsOptional()
  @IsBoolean()
  olhar_inss?: boolean;

  @IsOptional()
  @IsBoolean()
  olhar_pje_creta?: boolean;

  @IsOptional()
  @IsString()
  senha_inss?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  data_cadastro?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  data_agendamento?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  data_ultima_atualizacao?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  data_protocolo?: string;

  @Type(() => StatusProcesso)
  @IsNotEmpty()
  status: StatusProcesso;

  @IsOptional()
  @Type(() => TipoAgendamento)
  tipo_agendamento?: TipoAgendamento;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
