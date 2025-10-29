import { IsString } from 'class-validator';

export class CreateEnderecoDto {
  @IsString() logradouro: string;
  @IsString() numero: string;
  @IsString() complemento: string;
  @IsString() bairro: string;
  @IsString() cidade: string;
  @IsString() estado: string;
  @IsString() cep: string;
}
