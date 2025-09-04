import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UsuarioDto {
  @IsNotEmpty()
  @ApiProperty()
  nome: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  cpf: string;

  @IsNotEmpty()
  @ApiProperty()
  senha: string;
}
