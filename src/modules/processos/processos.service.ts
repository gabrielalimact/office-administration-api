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
      let funcionario = null;
      if (createProcessoDto.funcionarioId) {
        funcionario = await manager.findOne(Usuario, {
          where: { id: createProcessoDto.funcionarioId },
        });
        if (!funcionario) {
          throw new Error('funcionario não encontrado');
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
        telefone: createProcessoDto.cliente.telefone || null,
        endereco,
      });

      const clienteSalvo = await manager.save(Cliente, cliente);

      const processo = manager.create(Processo, {
        cliente: clienteSalvo,
        funcionario,
        beneficio: createProcessoDto.beneficio,
        colaborador_responsavel:
          createProcessoDto.colaborador_responsavel || '',
        olhar_inss: createProcessoDto.olhar_inss || false,
        olhar_pje_creta: createProcessoDto.olhar_pje_creta || false,
        senha_inss: createProcessoDto.senha_inss || null,
        data_cadastro:
          createProcessoDto.data_cadastro ||
          new Date().toISOString().split('T')[0],
        data_ultima_atualizacao:
          createProcessoDto.data_ultima_atualizacao ||
          new Date().toISOString().split('T')[0],
        data_protocolo: createProcessoDto.data_protocolo || null,
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

          const dadosArquivo = await this.arquivoService.salvarArquivo(
            file,
            nomePersonalizado,
          );

          const arquivo = manager.create(Arquivo, {
            nome_original: dadosArquivo.nome_original,
            nome_arquivo: dadosArquivo.nome_arquivo,
            caminho: dadosArquivo.caminho,
            tamanho: dadosArquivo.tamanho,
            tipo_mime: dadosArquivo.tipo_mime,
            processo: { id: processo.id } as any,
          });
          console.log('[Arquivo->save] processoId=', processoSalvo.id);
          console.log('[Arquivo->save] payload=', {
            nome_arquivo: dadosArquivo.nome_arquivo,
            hasProcesso: !!(arquivo as any).processo,
            processoIdInPayload: (arquivo as any).processo?.id ?? null,
          });
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

      const funcionario = await manager.findOne(Usuario, {
        where: { id: dto.funcionarioId },
      });
      if (!funcionario) {
        throw new Error('funcionario não encontrado');
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
        colaborador_responsavel: dto.colaborador_responsavel || '',
        data_cadastro: dto.data_cadastro,
        data_protocolo: dto.data_protocolo || null,
        observacoes: dto.observacoes,
        data_ultima_atualizacao:
          dto.data_ultima_atualizacao || new Date().toISOString().split('T')[0],
        cliente: { id: clienteId },
        funcionario,
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

          const dadosArquivo = await this.arquivoService.salvarArquivo(
            file,
            nomePersonalizado,
          );

          const arquivo = manager.create(Arquivo, {
            nome_original: dadosArquivo.nome_original,
            nome_arquivo: dadosArquivo.nome_arquivo,
            caminho: dadosArquivo.caminho,
            tamanho: dadosArquivo.tamanho,
            tipo_mime: dadosArquivo.tipo_mime,
            processo: { id: processoSalvo.id } as any,
          });
          console.log('[Arquivo->save] processoId=', processoSalvo.id);
          console.log('[Arquivo->save] payload=', {
            nome_arquivo: dadosArquivo.nome_arquivo,
            hasProcesso: !!(arquivo as any).processo,
            processoIdInPayload: (arquivo as any).processo?.id ?? null,
          });
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
        'documentos',
        'funcionario',
      ],
      order: {
        data_ultima_atualizacao: 'DESC',
      },
    });

    return processos.map((processo) => ({
      ...processo,
      funcionario: processo.funcionario
        ? {
            id: processo.funcionario.id,
            nome: processo.funcionario.nome,
            cargo: processo.funcionario.cargo,
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
        'funcionario',
      ],
      order: {
        data_ultima_atualizacao: 'DESC',
      },
    });

    return processos.map((processo) => ({
      ...processo,
      funcionario: processo.funcionario
        ? {
            id: processo.funcionario.id,
            nome: processo.funcionario.nome,
            cargo: processo.funcionario.cargo,
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
        'funcionario',
      ],
    });

    if (!processo) {
      return null;
    }

    return {
      ...processo,
      funcionario: processo.funcionario
        ? {
            id: processo.funcionario.id,
            nome: processo.funcionario.nome,
            cargo: processo.funcionario.cargo,
          }
        : null,
    };
  }

  async update(
    id: number,
    updateProcessoDto: UpdateProcessoDto,
    file?: Express.Multer.File,
  ) {
    const processo = await this.processosRepository.findOne({
      where: { id },
      relations: ['cliente', 'documentos'],
    });

    if (!processo) {
      throw new Error('Processo não encontrado');
    }

    Object.assign(processo, updateProcessoDto);
    processo.data_ultima_atualizacao = new Date().toISOString().split('T')[0];

    const processoSalvo = await this.processosRepository.save(processo);

    if (file) {
      const nomeCliente = processo.cliente.nome.replace(/\s+/g, '_');
      const dataCadastro = processo.data_cadastro.replace(/-/g, '');
      const extensao = file.originalname.split('.').pop();
      const nomePersonalizado = `${nomeCliente}_${dataCadastro}_${Date.now()}.${extensao}`;

      const dadosArquivo = await this.arquivoService.salvarArquivo(
        file,
        nomePersonalizado,
      );

      const arquivo = this.arquivoRepository.create({
        nome_original: dadosArquivo.nome_original,
        nome_arquivo: dadosArquivo.nome_arquivo,
        caminho: dadosArquivo.caminho,
        tamanho: dadosArquivo.tamanho,
        tipo_mime: dadosArquivo.tipo_mime,
        processo: { id: processo.id } as any,
      });
      console.log('[Arquivo->save] processoId=', processoSalvo.id);
      console.log('[Arquivo->save] payload=', {
        nome_arquivo: dadosArquivo.nome_arquivo,
        hasProcesso: !!(arquivo as any).processo,
        processoIdInPayload: (arquivo as any).processo?.id ?? null,
      });
      await this.arquivoRepository.save(arquivo);
    }

    return processoSalvo;
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

    const dadosArquivo = await this.arquivoService.salvarArquivo(
      file,
      nomePersonalizado,
    );

    const arquivo = this.arquivoRepository.create({
      nome_original: dadosArquivo.nome_original,
      nome_arquivo: dadosArquivo.nome_arquivo,
      caminho: dadosArquivo.caminho,
      tamanho: dadosArquivo.tamanho,
      tipo_mime: dadosArquivo.tipo_mime,
      processo: { id: processoId },
    });

    await this.arquivoRepository.save(arquivo);

    return processo;
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
    const processo = await this.processosRepository.findOne({
      where: { id: processoId },
    });

    if (!processo) {
      throw new Error('Processo não encontrado');
    }

    const documento = await this.arquivoService.buscarPorId(documentoId);
    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    const documentosProcesso =
      await this.arquivoService.buscarPorProcesso(processoId);
    const documentoValido = documentosProcesso.find(
      (d) => d.id === documentoId,
    );

    if (!documentoValido) {
      throw new Error('Documento não pertence a este processo');
    }

    await this.arquivoService.deletarArquivo(documentoId);

    processo.data_ultima_atualizacao = new Date().toISOString().split('T')[0];
    await this.processosRepository.save(processo);
  }
}
