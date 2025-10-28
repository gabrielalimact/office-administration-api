import { DataSource } from 'typeorm';
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

  console.log('🔗 Tentando conectar com as configurações:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Username: ${config.username}`);
  console.log(`   Database: ${config.database}`);
  console.log('   Password: [OCULTA]');

  const dataSource = new DataSource({
    ...config,
    entities: [],
    synchronize: false,
    logging: false,
  });

  return dataSource;
}

export async function clearDatabase(dataSource: DataSource) {
  console.log('🧹 Iniciando limpeza do banco de dados...');

  try {
    // Limpar na ordem correta para evitar erros de chave estrangeira
    const tables = [
      'relatorios',
      'processos',
      'clientes',
      'enderecos',
      'usuario',
      'status_processo',
      'beneficios',
      'arquivos',
    ];

    for (const table of tables) {
      try {
        await dataSource.query(`DELETE FROM ${table}`);
        console.log(`✅ Tabela ${table} limpa`);
      } catch (error) {
        console.log(
          `⚠️  Tabela ${table} não encontrada ou erro: ${error.message}`,
        );
      }
    }

    console.log('🎉 Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    throw error;
  }
}

if (require.main === module) {
  (async () => {
    let dataSource: DataSource | null = null;

    try {
      // Tentar usar o data-source padrão primeiro
      console.log('📡 Tentando conexão com data-source padrão...');
      const { AppDataSource } = await import('../src/data-source');
      dataSource = AppDataSource;

      await dataSource.initialize();
      console.log('✅ Conectado com sucesso!');
    } catch (error) {
      console.log('❌ Falha na conexão padrão:', error.message);
      console.log('🔄 Tentando conexão alternativa...');

      try {
        dataSource = await createServerDataSource();
        await dataSource.initialize();
        console.log('✅ Conectado com configuração alternativa!');
      } catch (altError) {
        console.error('❌ Falha na conexão alternativa:', altError.message);
        console.log('\n💡 Dicas para resolver:');
        console.log('1. Verifique se o PostgreSQL está rodando');
        console.log('2. Confirme a porta (padrão: 5432, não 5433)');
        console.log('3. Verifique as variáveis de ambiente no .env');
        console.log(
          '4. Teste a conexão: psql -h localhost -p 5432 -U postgres',
        );
        process.exit(1);
      }
    }

    try {
      await clearDatabase(dataSource);
    } finally {
      if (dataSource) {
        await dataSource.destroy();
        console.log('🔌 Conexão fechada');
      }
    }
  })();
}
