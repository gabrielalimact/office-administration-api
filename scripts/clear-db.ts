import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();
export async function clearDatabase(dataSource: DataSource) {
  await dataSource.query('DELETE FROM processos');
  await dataSource.query('DELETE FROM clientes');
  await dataSource.query('DELETE FROM enderecos');
  await dataSource.query('DELETE FROM usuario');
  await dataSource.query('DELETE FROM status_processo');
  await dataSource.query('DELETE FROM beneficios');
}

if (require.main === module) {
  import('../src/data-source').then(async ({ AppDataSource }) => {
    await AppDataSource.initialize();
    await clearDatabase(AppDataSource);
    await AppDataSource.destroy();
    console.log('Banco limpo com sucesso!');
  });
}
