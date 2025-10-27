import { ApiProperty } from '@nestjs/swagger';
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

  @IsEnum(CargoUsuario)
  @ApiProperty({ enum: CargoUsuario })
  cargo: CargoUsuario;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  id_imagem?: number;
}

export class UsuarioSemSenhaDto {
  @IsNotEmpty()
  @ApiProperty()
  nome: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  cpf: string;

  @IsEnum(CargoUsuario)
  @ApiProperty({ enum: CargoUsuario })
  cargo: CargoUsuario;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  id_imagem?: number;
}
