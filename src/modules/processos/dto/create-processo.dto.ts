import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateClienteDto } from 'src/modules/cliente/dto/create-cliente.dto';

export class CreateProcessoDto {
  @ApiProperty({ type: () => CreateClienteDto })
  @ValidateNested()
  @Type(() => CreateClienteDto)
  cliente: CreateClienteDto;

  @ApiProperty()
  @IsString()
  colaborador: string;

  @ApiProperty()
  @IsString()
  beneficio: string;

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
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  observacoes: string;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  @IsOptional()
  links_documentos: string[];
}
