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
import { Relatorio } from '../src/modules/relatorios/entities/relatorios.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

export async function seedAll(dataSource: DataSource) {
  const statusList = [
    'PERÍCIA',
    'AVALIAÇÃO SOCIAL',
    'AUDIENCIA',
    'PERICIA MEDICA INICIAL',
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
    const cpf = `${i.toString().padStart(11, '0')}`;

    // Verificar se cliente já existe
    let cliente = await clienteRepo.findOne({ where: { cpf } });
    if (!cliente) {
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

      cliente = clienteRepo.create({
        nome: `Cliente ${i}`,
        data_nascimento: `1990-01-${i.toString().padStart(2, '0')}`,
        cpf: cpf,
        rg: `${1000000 + i}`,
        filiacao: `Pai Cliente ${i}`,
        naturalidade: 'Cidade Exemplo',
        endereco: endereco,
      });
      await clienteRepo.save(cliente);
    }
    clientes.push(cliente);
  }

  // Seed Funcionários (Usuários)
  const usuarioRepo = dataSource.getRepository(Usuario);
  const senhaHash = await bcrypt.hash('123456', 10);

  // Verificar se admin já existe
  const adminCpf = '12345678909';
  let admin = await usuarioRepo.findOne({ where: { cpf: adminCpf } });
  if (!admin) {
    admin = usuarioRepo.create({
      nome: `ADMIN`,
      cpf: adminCpf,
      email: `socio@exemplo.com`,
      senha: senhaHash,
      cargo: CargoUsuario.SOCIO,
    });
    await usuarioRepo.save(admin);
  }

  const funcionarios = [];
  for (let i = 1; i <= 6; i++) {
    const cpf = `${(90000000000 + i).toString()}`;

    // Verificar se funcionário já existe
    let usuario = await usuarioRepo.findOne({ where: { cpf } });
    if (!usuario) {
      usuario = usuarioRepo.create({
        nome: `Funcionário ${i}`,
        cpf: cpf,
        email: `funcionario${i}@exemplo.com`,
        senha: senhaHash,
        cargo: CargoUsuario.FUNCIONARIO,
      });
      await usuarioRepo.save(usuario);
    }
    funcionarios.push(usuario);
  }

  const processoRepo = dataSource.getRepository(Processo);
  const status = await statusRepo.findOneBy({ nome: 'PERÍCIA' });
  const beneficiosArray = await beneficioRepo.find();
  if (!beneficiosArray.length) {
    throw new Error('Nenhum benefício encontrado para semear processos.');
  }
  const randomIndex = () => Math.floor(Math.random() * beneficiosArray.length);
  const idx1 = randomIndex();
  let idx2 = randomIndex();
  if (beneficiosArray.length > 1) {
    while (idx2 === idx1) {
      idx2 = randomIndex();
    }
  }
  const beneficio1 = beneficiosArray[idx1];
  const beneficio2 = beneficiosArray[idx2];

  for (let index = 0; index < clientes.length; index++) {
    const cliente = clientes[index];
    const colaborador1 = funcionarios[index % funcionarios.length];
    const colaborador2 = funcionarios[(index + 1) % funcionarios.length];

    // Verificar se processos já existem para este cliente
    const processosExistentes = await processoRepo.find({
      where: { cliente: { id: cliente.id } },
    });

    if (processosExistentes.length < 2) {
      const processo1 = processoRepo.create({
        cliente: cliente,
        colaborador: colaborador1, // Passando o objeto Usuario, não apenas o nome
        beneficio: beneficio1,
        olhar_inss: false,
        olhar_pje_creta: false,
        senha_inss: 'senha123',
        data_atendimento: '2025-09-18',
        data_ultima_atualizacao: '2025-09-18',
        status: status,
        observacoes: 'Processo 1 exemplo',
      });
      await processoRepo.save(processo1);

      if (processosExistentes.length < 1) {
        const processo2 = processoRepo.create({
          cliente: cliente,
          colaborador: colaborador2, // Passando o objeto Usuario, não apenas o nome
          beneficio: beneficio2,
          olhar_inss: true,
          olhar_pje_creta: true,
          senha_inss: 'senha456',
          data_atendimento: '2025-09-19',
          data_ultima_atualizacao: '2025-09-19',
          status: status,
          observacoes: 'Processo 2 exemplo',
        });
        await processoRepo.save(processo2);
      }
    }
  }

  // Seed Relatórios
  const relatorioRepo = dataSource.getRepository(Relatorio);
  for (let i = 0; i < funcionarios.length; i++) {
    const funcionario = funcionarios[i];

    // Verificar se relatório já existe para este funcionário
    const relatorioExistente = await relatorioRepo.findOne({
      where: { funcionario: { id: funcionario.id } },
    });

    if (!relatorioExistente) {
      const relatorio = relatorioRepo.create({
        funcionario: funcionario,
        titulo: `Relatório Mensal - ${funcionario.nome}`,
        conteudo: `Este é um relatório de exemplo para ${funcionario.nome}. 
        
Atividades realizadas:
- Atendimento a clientes
- Análise de processos
- Elaboração de documentos
- Acompanhamento de prazos

Observações: Todas as atividades foram concluídas conforme planejado.`,
      });
      await relatorioRepo.save(relatorio);
    }
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
