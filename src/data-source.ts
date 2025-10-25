import { DataSource } from 'typeorm';
import { Usuario } from './modules/usuario/entity/usuario.entity';
import { Cliente } from './modules/cliente/entities/cliente.entity';
import { Endereco } from './modules/enderecos/entities/endereco.entity';
import { Processo } from './modules/processos/entities/processo.entity';
import { StatusProcesso } from './modules/processos/entities/status-processo.entity';
import { Beneficio } from './modules/processos/entities/beneficios.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  port: parseInt(process.env.PORT, 10),
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  entities: [Usuario, Cliente, Endereco, Processo, StatusProcesso, Beneficio],
  synchronize: true,
});
