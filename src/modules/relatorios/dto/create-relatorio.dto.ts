import { IsInt, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateRelatorioDto {
  @IsInt()
  idFuncionario: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  titulo?: string;

  @IsString()
  @MinLength(1)
  conteudo: string;
}
