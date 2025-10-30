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

export class CreateProcessoDto {
  @ValidateNested()
  @Type(() => CreateClienteDto)
  @IsNotEmpty()
  cliente: CreateClienteDto;

  @IsOptional()
  @IsNumber()
  colaboradorId?: number;

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
  data_atendimento?: string;

  @IsOptional()
  @IsString()
  @IsDateString()
  data_ultima_atualizacao?: string;

  @Type(() => StatusProcesso)
  @IsNotEmpty()
  status: StatusProcesso;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
