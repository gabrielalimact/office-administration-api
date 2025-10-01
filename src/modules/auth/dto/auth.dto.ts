import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  cpf: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  senha: string;
}
