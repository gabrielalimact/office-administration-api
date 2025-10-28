import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateRelatorioDto {
  @ApiProperty({ description: 'ID do funcionário responsável pelo relatório' })
  @IsInt()
  idFuncionario: number;

  @ApiProperty({ description: 'Título do relatório' })
  @IsString()
  @MinLength(1)
  @IsOptional()
  titulo?: string;

  @ApiProperty({ description: 'Conteúdo detalhado do relatório' })
  @IsString()
  @MinLength(1)
  conteudo: string;
}
