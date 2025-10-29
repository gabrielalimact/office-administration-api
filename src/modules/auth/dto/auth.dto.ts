import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}
