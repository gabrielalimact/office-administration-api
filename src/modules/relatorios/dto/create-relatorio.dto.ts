import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateRelatorioDto {
  @IsInt()
  idFuncionario: number;

  @IsString()
  @MinLength(1)
  conteudo: string;
}
