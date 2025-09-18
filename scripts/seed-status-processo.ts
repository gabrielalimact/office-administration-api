import { DataSource } from 'typeorm';
import { StatusProcesso } from '../src/modules/processos/entities/status-processo.entity';

const statusList = [
  'ARQUIVADO',
  'EM ANDAMENTO',
  'FINALIZADO',
  'REMARCADO',
  'CANCELADO',
  'CONCEDIDO',
  'FAZER EXAMES',
  'FAZER ATESTADO',
  'PEGAR SENHA',
  'FEITO PJE',
  'FEITO SAG',
];

export async function seedStatusProcesso(dataSource: DataSource) {
  const repo = dataSource.getRepository(StatusProcesso);
  for (const nome of statusList) {
    const exists = await repo.findOneBy({ nome });
    if (!exists) {
      const status = repo.create({ nome });
      await repo.save(status);
    }
  }
}

// Para rodar manualmente:
if (require.main === module) {
  import('../src/data-source').then(async ({ AppDataSource }) => {
    await AppDataSource.initialize();
    await seedStatusProcesso(AppDataSource);
    await AppDataSource.destroy();
    console.log('StatusProcesso seed concluído!');
  });
}
