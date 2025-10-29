import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { CreateClienteDto } from '../../cliente/dto/create-cliente.dto';
import { StatusProcesso } from '../entities/status-processo.entity';
import { Beneficio } from '../entities/beneficios.entity';

export class CreateProcessoDto {
  @ValidateNested()
  @Type(() => CreateClienteDto)
  cliente: CreateClienteDto;

  @IsNumber()
  colaboradorId: number;

  @Type(() => Beneficio)
  beneficio: Beneficio;

  @IsBoolean()
  olhar_inss: boolean;

  @IsBoolean()
  olhar_pje_creta: boolean;

  @IsString()
  @IsOptional()
  senha_inss: string;

  @IsString()
  @IsDateString()
  data_atendimento: string;

  @IsString()
  @IsDateString()
  data_ultima_atualizacao: string;

  @Type(() => StatusProcesso)
  status: StatusProcesso;

  @IsString()
  @IsOptional()
  observacoes: string;
}
