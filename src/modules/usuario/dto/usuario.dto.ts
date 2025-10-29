import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { CargoUsuario } from '../entity/usuario.entity';

export class UsuarioDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  cpf: string;

  @IsNotEmpty()
  senha: string;

  @IsEnum(CargoUsuario)
  cargo: CargoUsuario;

  @IsOptional()
  @IsNumber()
  id_imagem?: number;
}

export class UsuarioSemSenhaDto {
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  cpf: string;

  @IsEnum(CargoUsuario)
  cargo: CargoUsuario;

  @IsOptional()
  @IsNumber()
  id_imagem?: number;
}
