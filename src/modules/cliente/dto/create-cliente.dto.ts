import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEnderecoDto } from 'src/modules/enderecos/dto/create-endereco.dto';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsDateString()
  data_nascimento?: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  filiacao?: string;

  @IsOptional()
  @IsString()
  naturalidade?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEnderecoDto)
  endereco?: CreateEnderecoDto;
}
