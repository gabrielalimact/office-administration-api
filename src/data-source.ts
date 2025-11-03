import { DataSource } from 'typeorm';
import { Usuario } from './modules/usuario/entity/usuario.entity';
import { Cliente } from './modules/cliente/entities/cliente.entity';
import { Endereco } from './modules/enderecos/entities/endereco.entity';
import { Processo } from './modules/processos/entities/processo.entity';
import { StatusProcesso } from './modules/processos/entities/status-processo.entity';
import { Beneficio } from './modules/processos/entities/beneficios.entity';
import { Arquivo } from './modules/arquivo/entities/arquivo.entity';
import { Relatorio } from './modules/relatorios/entities/relatorios.entity';
import { AuditoriaLog } from './modules/auditoria/entities/auditoria-log.entity';
import { TipoAgendamento } from './modules/processos/entities/agendamento.entity';
import * as dotenv from 'dotenv';
dotenv.config();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Usuario,
    Cliente,
    Endereco,
    Processo,
    StatusProcesso,
    Beneficio,
    Arquivo,
    Relatorio,
    AuditoriaLog,
    TipoAgendamento,
  ],
  migrations: ['dist/migrations/*.js'],
  migrationsTableName: 'migrations',
  synchronize: true,
});
