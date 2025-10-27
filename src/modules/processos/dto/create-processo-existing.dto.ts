import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateProcessoExistingDto {
  @IsInt()
  statusId: number;

  @IsInt()
  beneficioId: number;

  @IsString()
  colaborador: string;

  @IsBoolean()
  olhar_inss: boolean;

  @IsBoolean()
  olhar_pje_creta: boolean;

  @IsString()
  @IsOptional()
  senha_inss?: string;

  @IsDateString()
  data_atendimento: string;

  @IsDateString()
  @IsOptional()
  data_ultima_atualizacao: string;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsArray()
  @IsString({ each: true })
  links_documentos: string[];
}
