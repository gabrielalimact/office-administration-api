import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEnderecoDto {
  @ApiProperty() @IsString() logradouro: string;
  @ApiProperty() @IsString() numero: string;
  @ApiProperty() @IsString() complemento: string;
  @ApiProperty() @IsString() bairro: string;
  @ApiProperty() @IsString() cidade: string;
  @ApiProperty() @IsString() estado: string;
  @ApiProperty() @IsString() cep: string;
}
