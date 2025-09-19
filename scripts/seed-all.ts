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

  // Seed Clientes
  const clienteRepo = dataSource.getRepository(Cliente);
  const clientes = [];
  for (let i = 1; i <= 12; i++) {
    const endereco = enderecoRepo.create({
      logradouro: `Rua Exemplo ${i}`,
      numero: `${100 + i}`,
      complemento: `Apto ${i}`,
      bairro: 'Centro',
      cidade: 'Cidade Exemplo',
      estado: 'EX',
      cep: `00000-0${i.toString().padStart(2, '0')}`,
    });
    await enderecoRepo.save(endereco);
    const cliente = clienteRepo.create({
      nome: `Cliente ${i}`,
      data_nascimento: `1990-01-${i.toString().padStart(2, '0')}`,
      cpf: `${i.toString().padStart(11, '0')}`,
      rg: `${1000000 + i}`,
      filiacao: `Pai Cliente ${i}`,
      naturalidade: 'Cidade Exemplo',
      endereco: endereco,
    });
    await clienteRepo.save(cliente);
    clientes.push(cliente);
  }

  // Seed Funcionários (Usuários)
  const usuarioRepo = dataSource.getRepository(Usuario);
  for (let i = 1; i <= 6; i++) {
    const usuario = usuarioRepo.create({
      nome: `Funcionário ${i}`,
      cpf: `${(90000000000 + i).toString()}`,
      email: `funcionario${i}@exemplo.com`,
      senha: '123456',
      cargo: CargoUsuario.FUNCIONARIO,
    });
    await usuarioRepo.save(usuario);
  }

  // Seed Processos (2 para cada cliente)
  const processoRepo = dataSource.getRepository(Processo);
  const status = await statusRepo.findOneBy({ nome: 'EM ANDAMENTO' });
  const beneficio1 = await beneficioRepo.findOneBy({ nome: 'LOAS/88' });
  const beneficio2 = await beneficioRepo.findOneBy({ nome: 'APOSENTADORIA' });
  for (const cliente of clientes) {
    const processo1 = processoRepo.create({
      cliente: cliente,
      colaborador: 'Colaborador 1',
      beneficio: beneficio1,
      olhar_inss: false,
      olhar_pje_creta: false,
      senha_inss: 'senha123',
      data_atendimento: '2025-09-18',
      data_ultima_atualizacao: '2025-09-18',
      status: status,
      observacoes: 'Processo 1 exemplo',
      links_documentos: [],
    });
    await processoRepo.save(processo1);
    const processo2 = processoRepo.create({
      cliente: cliente,
      colaborador: 'Colaborador 2',
      beneficio: beneficio2,
      olhar_inss: true,
      olhar_pje_creta: true,
      senha_inss: 'senha456',
      data_atendimento: '2025-09-19',
      data_ultima_atualizacao: '2025-09-19',
      status: status,
      observacoes: 'Processo 2 exemplo',
      links_documentos: [],
    });
    await processoRepo.save(processo2);
  }
}

if (require.main === module) {
  import('../src/data-source').then(async ({ AppDataSource }) => {
    await AppDataSource.initialize();
    await seedAll(AppDataSource);
    await AppDataSource.destroy();
    console.log('Seed de todas as tabelas concluído!');
  });
}
