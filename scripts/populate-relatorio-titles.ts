import { DataSource } from 'typeorm';
import { Relatorio } from '../src/modules/relatorios/entities/relatorios.entity';
import * as dotenv from 'dotenv';
dotenv.config();

async function createServerDataSource(): Promise<DataSource> {
  const config = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
  };

  console.log('🔗 Configurações de conexão:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Username: ${config.username}`);
  console.log(`   Database: ${config.database}`);
  console.log(
    `   Password: ${config.password ? '[DEFINIDA]' : '[VAZIA/UNDEFINED]'}`,
  );

  // Verificar se senha está definida
  if (!config.password || config.password.trim() === '') {
    throw new Error(
      'Senha do banco não definida! Verifique DB_PASSWORD no arquivo .env',
    );
  }

  const dataSource = new DataSource({
    ...config,
    entities: [Relatorio],
    synchronize: false,
    logging: false,
  });

  return dataSource;
}

async function populateRelatorioTitles() {
  let dataSource: DataSource | null = null;

  try {
    console.log('📡 Tentando conexão com data-source padrão...');

    try {
      const { AppDataSource } = await import('../src/data-source');
      dataSource = AppDataSource;
      await dataSource.initialize();
      console.log('✅ Conectado com data-source padrão!');
    } catch (error) {
      console.log('❌ Falha na conexão padrão:', error.message);
      console.log('🔄 Tentando conexão alternativa...');

      dataSource = await createServerDataSource();
      await dataSource.initialize();
      console.log('✅ Conectado com configuração alternativa!');
    }

    console.log('📊 Buscando relatórios sem título...');
    const relatorioRepository = dataSource.getRepository(Relatorio);

    const relatoriosSemTitulo = await relatorioRepository.find({
      where: { titulo: null },
      relations: ['funcionario'],
    });

    console.log(
      `📝 Encontrados ${relatoriosSemTitulo.length} relatórios sem título`,
    );

    if (relatoriosSemTitulo.length === 0) {
      console.log('🎉 Todos os relatórios já possuem título!');
      return;
    }

    for (const relatorio of relatoriosSemTitulo) {
      const dataFormatada = relatorio.created_at.toLocaleDateString('pt-BR');
      const novoTitulo = `Relatório #${relatorio.id} - ${dataFormatada}`;

      await relatorioRepository.update(relatorio.id, {
        titulo: novoTitulo,
      });

      console.log(
        `✅ Título atualizado para relatório ${relatorio.id}: "${novoTitulo}"`,
      );
    }

    console.log('🎉 Todos os títulos foram populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular títulos:', error.message);

    if (error.message.includes('password must be a string')) {
      console.log('\n💡 Solução: Verifique o arquivo .env');
      console.log('   - DB_PASSWORD deve estar definida como string');
      console.log('   - Exemplo: DB_PASSWORD="minha_senha_aqui"');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Soluções:');
      console.log('1. Verifique se PostgreSQL está rodando');
      console.log('2. Confirme a porta (5432 é padrão)');
      console.log('3. Verifique credenciais no .env');
    }
  } finally {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Conexão fechada');
    }
  }
}

populateRelatorioTitles();
