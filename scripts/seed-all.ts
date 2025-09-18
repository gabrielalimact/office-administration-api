import { DataSource } from 'typeorm';
import {
  Usuario,
  CargoUsuario,
} from '../src/modules/usuario/entity/usuario.entity';
import { Cliente } from '../src/modules/cliente/entities/cliente.entity';
import { Endereco } from '../src/modules/enderecos/entities/endereco.entity';
import { Processo } from '../src/modules/processos/entities/processo.entity';
import { StatusProcesso } from '../src/modules/processos/entities/status-processo.entity';
import { Beneficio } from '../src/modules/processos/entities/beneficios.entity';

export async function seedAll(dataSource: DataSource) {
  // Seed StatusProcesso
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
  const statusRepo = dataSource.getRepository(StatusProcesso);
  for (const nome of statusList) {
    const exists = await statusRepo.findOneBy({ nome });
    if (!exists) {
      const status = statusRepo.create({ nome });
      await statusRepo.save(status);
    }
  }

  const beneficioList = [
    'LOAS/88',
    'LOAS/87',
    'PENSÃO DE MORTE URBANA OU RURAL',
    'APOSENTADORIA',
    'AUXÍLIO DOENÇA',
  ];
  const beneficioRepo = dataSource.getRepository(Beneficio);
  for (const nome of beneficioList) {
    const exists = await beneficioRepo.findOneBy({ nome });
    if (!exists) {
      const beneficio = beneficioRepo.create({ nome });
      await beneficioRepo.save(beneficio);
    }
  }

  // Seed Endereco
  const enderecoRepo = dataSource.getRepository(Endereco);
  const endereco = enderecoRepo.create({
    logradouro: 'Rua Exemplo',
    numero: '123',
    complemento: 'Apto 1',
    bairro: 'Centro',
    cidade: 'Cidade Exemplo',
    estado: 'EX',
    cep: '00000-000',
  });
  await enderecoRepo.save(endereco);

  // Seed Cliente
  const clienteRepo = dataSource.getRepository(Cliente);
  const cliente = clienteRepo.create({
    nome: 'Cliente Exemplo',
    data_nascimento: '1990-01-01',
    cpf: '00000000000',
    rg: '1234567',
    filiacao: 'Pai Exemplo',
    naturalidade: 'Cidade Exemplo',
    endereco: endereco,
  });
  await clienteRepo.save(cliente);

  // Seed Usuario
  const usuarioRepo = dataSource.getRepository(Usuario);
  const usuario = usuarioRepo.create({
    nome: 'Usuário Admin',
    cpf: '11111111111',
    email: 'admin@exemplo.com',
    senha: '123456',
    cargo: CargoUsuario.SOCIO,
  });
  await usuarioRepo.save(usuario);

  // Seed Processo
  const processoRepo = dataSource.getRepository(Processo);
  const status = await statusRepo.findOneBy({ nome: 'EM ANDAMENTO' });
  const beneficio = await beneficioRepo.findOneBy({ nome: 'LOAS/88' });
  const processo = processoRepo.create({
    cliente: cliente,
    colaborador: 'Colaborador Exemplo',
    beneficio: beneficio,
    olhar_inss: false,
    olhar_pje_creta: false,
    senha_inss: 'senha123',
    data_atendimento: '2025-09-18',
    data_ultima_atualizacao: '2025-09-18',
    status: status,
    observacoes: 'Observação exemplo',
    links_documentos: [],
  });
  await processoRepo.save(processo);
}

if (require.main === module) {
  import('../src/data-source').then(async ({ AppDataSource }) => {
    await AppDataSource.initialize();
    await seedAll(AppDataSource);
    await AppDataSource.destroy();
    console.log('Seed de todas as tabelas concluído!');
  });
}
