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
  @ValidateNested()
  @Type(() => CreateClienteDto)
  cliente: CreateClienteDto;

  @IsString()
  colaborador: string;

  @IsString()
  beneficio: string;

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
  @IsOptional()
  observacoes: string;

  @IsString({ each: true })
  @IsOptional()
  links_documentos: string[];
}
