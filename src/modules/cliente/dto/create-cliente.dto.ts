import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEnderecoDto } from 'src/modules/enderecos/dto/create-endereco.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty() nome: string;
  @ApiProperty() @IsDateString() data_nascimento: string;
  @ApiProperty() @IsString() cpf: string;
  @ApiProperty() @IsOptional() @IsString() rg?: string;
  @ApiProperty() @IsOptional() @IsString() filiacao?: string;
  @ApiProperty() @IsOptional() @IsString() naturalidade?: string;

  @ApiProperty({ type: CreateEnderecoDto })
  @ValidateNested()
  @Type(() => CreateEnderecoDto)
  endereco: CreateEnderecoDto;
}
