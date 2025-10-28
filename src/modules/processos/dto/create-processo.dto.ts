import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ type: () => CreateClienteDto })
  @ValidateNested()
  @Type(() => CreateClienteDto)
  cliente: CreateClienteDto;

  @ApiProperty({ description: 'ID do colaborador/usuário responsável' })
  @IsNumber()
  colaboradorId: number;

  @ApiProperty({ type: () => Beneficio })
  @Type(() => Beneficio)
  beneficio: Beneficio;

  @ApiProperty()
  @IsBoolean()
  olhar_inss: boolean;

  @ApiProperty()
  @IsBoolean()
  olhar_pje_creta: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  senha_inss: string;

  @ApiProperty()
  @IsString()
  @IsDateString()
  data_atendimento: string;

  @ApiProperty()
  @IsString()
  @IsDateString()
  data_ultima_atualizacao: string;

  @ApiProperty({ type: () => StatusProcesso })
  @Type(() => StatusProcesso)
  status: StatusProcesso;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observacoes: string;
}
