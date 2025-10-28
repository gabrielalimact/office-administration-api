import { AppDataSource } from '../src/data-source';
import { Relatorio } from '../src/modules/relatorios/entities/relatorios.entity';

async function populateRelatorioTitles() {
  try {
    await AppDataSource.initialize();
    const relatorioRepository = AppDataSource.getRepository(Relatorio);

    const relatoriosSemTitulo = await relatorioRepository.find({
      where: { titulo: null },
      relations: ['funcionario'],
    });

    for (const relatorio of relatoriosSemTitulo) {
      const dataFormatada = relatorio.created_at.toLocaleDateString('pt-BR');
      const novoTitulo = `Relatório #${relatorio.id} - ${dataFormatada}`;

      await relatorioRepository.update(relatorio.id, {
        titulo: novoTitulo,
      });
    }

    console.log('🎉 Todos os títulos foram populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular títulos:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

populateRelatorioTitles();
