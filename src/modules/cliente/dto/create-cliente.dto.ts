import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEnderecoDto } from 'src/modules/enderecos/dto/create-endereco.dto';

export class CreateClienteDto {
  @IsString() nome: string;
  @IsDateString() data_nascimento: string;
  @IsString() cpf: string;
  @IsOptional() @IsString() rg?: string;
  @IsOptional() @IsString() filiacao?: string;
  @IsOptional() @IsString() naturalidade?: string;

  @ValidateNested()
  @Type(() => CreateEnderecoDto)
  endereco: CreateEnderecoDto;
}
