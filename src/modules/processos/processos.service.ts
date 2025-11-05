import { Injectable } from '@nestjs/common';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Processo } from './entities/processo.entity';
import { Repository, DataSource } from 'typeorm';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { StatusProcesso } from './entities/status-processo.entity';
import { Beneficio } from './entities/beneficios.entity';
import { CreateProcessoExistingDto } from './dto/create-processo-existing.dto';
import { ArquivoService } from '../arquivo/arquivo.service';
import { Usuario } from '../usuario/entity/usuario.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { TipoEntidade } from '../auditoria/entities/auditoria-log.entity';
import { TipoAgendamento } from './entities/agendamento.entity';
import { Arquivo } from '../arquivo/entities/arquivo.entity';

@Injectable()
export class ProcessosService {
  constructor(
    @InjectRepository(Processo)
    private readonly processosRepository: Repository<Processo>,

    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,

    @InjectRepository(Endereco)
    private readonly enderecosRepository: Repository<Endereco>,

    @InjectRepository(StatusProcesso)
    private readonly statusProcessoRepository: Repository<StatusProcesso>,

    @InjectRepository(Beneficio)
    private readonly beneficioRepository: Repository<Beneficio>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Arquivo)
    private readonly arquivoRepository: Repository<Arquivo>,

    private readonly arquivoService: ArquivoService,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}
  async create(
    createProcessoDto: CreateProcessoDto,
    file?: Express.Multer.File,
    usuarioLogado?: Usuario,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      let colaborador = null;
      if (createProcessoDto.colaboradorId) {
        colaborador = await manager.findOne(Usuario, {
          where: { id: createProcessoDto.colaboradorId },
        });
        if (!colaborador) {
          throw new Error('Colaborador não encontrado');
        }
      }

      let endereco = null;
      if (createProcessoDto.cliente.endereco) {
        endereco = manager.create(Endereco, {
          ...createProcessoDto.cliente.endereco,
          logradouro: createProcessoDto.cliente.endereco.logradouro || '',
          numero: createProcessoDto.cliente.endereco.numero || '',
          complemento: createProcessoDto.cliente.endereco.complemento || '',
          bairro: createProcessoDto.cliente.endereco.bairro || '',
          cidade: createProcessoDto.cliente.endereco.cidade || '',
          estado: createProcessoDto.cliente.endereco.estado || '',
          cep: createProcessoDto.cliente.endereco.cep || '',
        });
        endereco = await manager.save(Endereco, endereco);
      }

      const cliente = manager.create(Cliente, {
        nome: createProcessoDto.cliente.nome,
        email: createProcessoDto.cliente.email || null,
        data_nascimento: createProcessoDto.cliente.data_nascimento || null,
        cpf: createProcessoDto.cliente.cpf,
        rg: createProcessoDto.cliente.rg || null,
        filiacao: createProcessoDto.cliente.filiacao || null,
        naturalidade: createProcessoDto.cliente.naturalidade || null,
        endereco,
      });
      const clienteSalvo = await manager.save(Cliente, cliente);

      const processo = manager.create(Processo, {
        cliente: clienteSalvo,
        colaborador,
        beneficio: createProcessoDto.beneficio,
        olhar_inss: createProcessoDto.olhar_inss || false,
        olhar_pje_creta: createProcessoDto.olhar_pje_creta || false,
        senha_inss: createProcessoDto.senha_inss || null,
        data_cadastro:
          createProcessoDto.data_cadastro ||
          new Date().toISOString().split('T')[0],
        data_ultima_atualizacao:
          createProcessoDto.data_ultima_atualizacao ||
          new Date().toISOString().split('T')[0],
        data_agendamento: createProcessoDto.data_agendamento || null,
        status: createProcessoDto.status,
        tipo_agendamento: createProcessoDto.tipo_agendamento || null,
        observacoes: createProcessoDto.observacoes || null,
      });

      const processoSalvo = await manager.save(Processo, processo);

      if (file) {
        try {
          const nomeCliente = clienteSalvo.nome.replace(/\s+/g, '_');
          const dataCadastro = (
            createProcessoDto.data_cadastro ||
            new Date().toISOString().split('T')[0]
          ).replace(/-/g, '');
          const extensao = file.originalname.split('.').pop();
          const nomePersonalizado = `${nomeCliente}_${dataCadastro}.${extensao}`;

          const arquivo = await this.arquivoService.salvarArquivo(
            file,
            nomePersonalizado,
            manager,
            false,
          );

          // Estabelecer a relação com o processo dentro da transação
          arquivo.processo = processoSalvo;
          await manager.save(Arquivo, arquivo);

          if (usuarioLogado) {
            await this.auditoriaService.registrarEnvioDocumento(
              usuarioLogado,
              processoSalvo.id,
              file.originalname,
              ipAddress,
              userAgent,
            );
          }
        } catch (error) {
          throw new Error(`Erro ao salvar arquivo: ${error.message}`);
        }
      }

      if (usuarioLogado) {
        await this.auditoriaService.registrarCriacao(
          usuarioLogado,
          TipoEntidade.CLIENTE,
          clienteSalvo.id,
          clienteSalvo,
          `Cliente "${clienteSalvo.nome}" criado`,
          ipAddress,
          userAgent,
        );

        await this.auditoriaService.registrarCriacao(
          usuarioLogado,
          TipoEntidade.PROCESSO,
          processoSalvo.id,
          processoSalvo,
          `Processo criado para cliente "${clienteSalvo.nome}"`,
          ipAddress,
          userAgent,
        );
      }

      return processoSalvo;
    });
  }

  async createForExistingClient(
    clienteId: number,
    dto: CreateProcessoExistingDto,
    file?: Express.Multer.File,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const cliente = await manager.findOne(Cliente, {
        where: { id: clienteId },
        relations: ['endereco'],
      });
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }

      const colaborador = await manager.findOne(Usuario, {
        where: { id: dto.colaboradorId },
      });
      if (!colaborador) {
        throw new Error('Colaborador não encontrado');
      }

      const status = await manager.findOne(StatusProcesso, {
        where: { id: dto.statusId },
      });
      if (!status) throw new Error('Status inválido');

      let tipo_agendamento = null;
      if (dto.tipoAgendamentoId) {
        tipo_agendamento = await manager.findOne(TipoAgendamento, {
          where: { id: dto.tipoAgendamentoId },
        });
        if (!tipo_agendamento) throw new Error('Tipo de agendamento inválido');
      }

      const beneficio = await manager.findOne(Beneficio, {
        where: { id: dto.beneficioId },
      });
      if (!beneficio) throw new Error('Benefício inválido');

      const processo = manager.create(Processo, {
        olhar_inss: dto.olhar_inss,
        olhar_pje_creta: dto.olhar_pje_creta,
        senha_inss: dto.senha_inss,
        data_cadastro: dto.data_cadastro,
        observacoes: dto.observacoes,
        data_ultima_atualizacao:
          dto.data_ultima_atualizacao || new Date().toISOString().split('T')[0],
        cliente: { id: clienteId },
        colaborador,
        status,
        tipo_agendamento,
        beneficio,
      });

      const processoSalvo = await manager.save(Processo, processo);

      if (file) {
        try {
          const nomeCliente = cliente.nome.replace(/\s+/g, '_');
          const dataCadastro = dto.data_cadastro.replace(/-/g, '');
          const extensao = file.originalname.split('.').pop();
          const nomePersonalizado = `${nomeCliente}_${dataCadastro}.${extensao}`;

          const arquivo = await this.arquivoService.salvarArquivo(
            file,
            nomePersonalizado,
            manager,
            false,
          );

          // Estabelecer a relação com o processo dentro da transação
          arquivo.processo = processoSalvo;
          await manager.save(Arquivo, arquivo);
        } catch (error) {
          throw new Error(`Erro ao salvar arquivo: ${error.message}`);
        }
      }

      return processoSalvo;
    });
  }
  async findAll() {
    const processos = await this.processosRepository.find({
      relations: [
        'cliente',
        'status',
        'tipo_agendamento',
        'beneficio',
        'arquivo_documentos',
        'documentos',
        'colaborador',
      ],
      order: {
        data_ultima_atualizacao: 'DESC',
      },
    });

    return processos.map((processo) => ({
      ...processo,
      colaborador: processo.colaborador
        ? {
            id: processo.colaborador.id,
            nome: processo.colaborador.nome,
            cargo: processo.colaborador.cargo,
          }
        : null,
    }));
  }

  async findByCliente(clienteId: number) {
    const processos = await this.processosRepository.find({
      where: { cliente: { id: clienteId } },
      relations: [
        'cliente',
        'status',
        'beneficio',
        'tipo_agendamento',
        'cliente.endereco',
        'documentos',
        'colaborador',
      ],
      order: {
        data_ultima_atualizacao: 'DESC',
      },
    });

    return processos.map((processo) => ({
      ...processo,
      colaborador: processo.colaborador
        ? {
            id: processo.colaborador.id,
            nome: processo.colaborador.nome,
            cargo: processo.colaborador.cargo,
          }
        : null,
    }));
  }
  findAllStatus() {
    return this.statusProcessoRepository.find().catch((e) => {
      console.error('Erro ao buscar status:', e);
      throw e;
    });
  }

  async findOne(id: number) {
    const processo = await this.processosRepository.findOne({
      where: { id },
      relations: [
        'cliente',
        'cliente.endereco',
        'status',
        'tipo_agendamento',
        'beneficio',
        'documentos',
        'colaborador',
      ],
    });

    if (!processo) {
      return null;
    }

    return {
      ...processo,
      colaborador: processo.colaborador
        ? {
            id: processo.colaborador.id,
            nome: processo.colaborador.nome,
            cargo: processo.colaborador.cargo,
          }
        : null,
    };
  }

  async update(
    id: number,
    updateProcessoDto: UpdateProcessoDto,
    file?: Express.Multer.File,
  ) {
    if (file) {
      await this.uploadDocumentos(id, file);
    }

    const processo = this.processosRepository.create({
      id,
      ...updateProcessoDto,
      data_ultima_atualizacao: new Date().toISOString().split('T')[0],
    });

    return this.processosRepository.save(processo);
  }

  remove(id: number) {
    return this.processosRepository.delete(id);
  }

  async uploadDocumentos(
    processoId: number,
    file: Express.Multer.File,
  ): Promise<Processo> {
    const processo = await this.processosRepository.findOne({
      where: { id: processoId },
      relations: ['cliente', 'documentos'],
    });

    if (!processo) {
      throw new Error('Processo não encontrado');
    }

    const nomeCliente = processo.cliente.nome.replace(/\s+/g, '_');
    const dataCadastro = processo.data_cadastro.replace(/-/g, '');
    const timestamp = Date.now();
    const extensao = file.originalname.split('.').pop();
    const nomePersonalizado = `${nomeCliente}_${dataCadastro}_${timestamp}.${extensao}`;

    // Adiciona o novo documento ao invés de substituir
    const arquivo = await this.arquivoService.salvarArquivo(
      file,
      nomePersonalizado,
      null,
      false,
    );

    // Estabelecer a relação com o processo
    await this.arquivoRepository.update(arquivo.id, {
      processo: { id: processoId } as any,
    });

    // Atualiza a data de última atualização do processo
    processo.data_ultima_atualizacao = new Date().toISOString().split('T')[0];

    return this.processosRepository.save(processo);
  }

  async listarDocumentosProcesso(processoId: number): Promise<any[]> {
    const documentos = await this.arquivoService.buscarPorProcesso(processoId);

    return documentos.map((doc) => ({
      id: doc.id,
      nome_original: doc.nome_original,
      nome_arquivo: doc.nome_arquivo,
      tamanho: doc.tamanho,
      tipo_mime: doc.tipo_mime,
      data_upload: doc.data_upload,
    }));
  }

  async removerDocumento(
    processoId: number,
    documentoId: number,
  ): Promise<void> {
    // Verificar se o processo existe
    const processo = await this.processosRepository.findOne({
      where: { id: processoId },
    });

    if (!processo) {
      throw new Error('Processo não encontrado');
    }

    // Verificar se o documento pertence ao processo
    const documento = await this.arquivoService.buscarPorId(documentoId);
    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    // Verificar se o documento está associado ao processo correto
    const documentosProcesso =
      await this.arquivoService.buscarPorProcesso(processoId);
    const documentoValido = documentosProcesso.find(
      (d) => d.id === documentoId,
    );

    if (!documentoValido) {
      throw new Error('Documento não pertence a este processo');
    }

    // Deletar o documento
    await this.arquivoService.deletarArquivo(documentoId);

    // Atualizar data de última atualização do processo
    processo.data_ultima_atualizacao = new Date().toISOString().split('T')[0];
    await this.processosRepository.save(processo);
  }
}
