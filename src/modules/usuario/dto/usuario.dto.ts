import { IsEmail, IsNotEmpty } from 'class-validator';

export class UsuarioDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  cpf: string;

  @IsNotEmpty()
  senha: string;
}
