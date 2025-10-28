import { Injectable } from '@nestjs/common';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Processo } from './entities/processo.entity';
import { Repository } from 'typeorm';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Endereco } from '../enderecos/entities/endereco.entity';
import { StatusProcesso } from './entities/status-processo.entity';
import { Beneficio } from './entities/beneficios.entity';
import { CreateProcessoExistingDto } from './dto/create-processo-existing.dto';
import { ArquivoService } from '../arquivo/arquivo.service';
import { Usuario } from '../usuario/entity/usuario.entity';

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

    private readonly arquivoService: ArquivoService,
  ) {}
  async create(
    createProcessoDto: CreateProcessoDto,
    file?: Express.Multer.File,
  ) {
    const colaborador = await this.usuarioRepository.findOne({
      where: { id: createProcessoDto.colaboradorId },
    });
    if (!colaborador) {
      throw new Error('Colaborador não encontrado');
    }

    const endereco = this.enderecosRepository.create(
      createProcessoDto.cliente.endereco,
    );
    await this.enderecosRepository.save(endereco);

    const cliente = this.clientesRepository.create({
      ...createProcessoDto.cliente,
      endereco,
    });
    await this.clientesRepository.save(cliente);

    const processo = this.processosRepository.create({
      cliente,
      colaborador,
      beneficio: createProcessoDto.beneficio,
      olhar_inss: createProcessoDto.olhar_inss,
      olhar_pje_creta: createProcessoDto.olhar_pje_creta,
      senha_inss: createProcessoDto.senha_inss,
      data_atendimento: createProcessoDto.data_atendimento,
      data_ultima_atualizacao: createProcessoDto.data_ultima_atualizacao,
      status: createProcessoDto.status,
      observacoes: createProcessoDto.observacoes,
    });

    const processoSalvo = await this.processosRepository.save(processo);

    if (file) {
      const nomeCliente = cliente.nome.replace(/\s+/g, '_');
      const dataAtendimento = createProcessoDto.data_atendimento.replace(
        /-/g,
        '',
      );
      const extensao = file.originalname.split('.').pop();
      const nomePersonalizado = `${nomeCliente}_${dataAtendimento}.${extensao}`;

      const arquivo = await this.arquivoService.salvarArquivo(
        file,
        nomePersonalizado,
      );
      processoSalvo.arquivo_documentos = arquivo;
      await this.processosRepository.save(processoSalvo);
    }

    return processoSalvo;
  }

  async createForExistingClient(
    clienteId: number,
    dto: CreateProcessoExistingDto,
    file?: Express.Multer.File,
  ) {
    const cliente = await this.clientesRepository.findOne({
      where: { id: clienteId },
      relations: ['endereco'],
    });
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    const colaborador = await this.usuarioRepository.findOne({
      where: { id: dto.colaboradorId },
    });
    if (!colaborador) {
      throw new Error('Colaborador não encontrado');
    }

    const status = await this.statusProcessoRepository.findOne({
      where: { id: dto.statusId },
    });
    if (!status) throw new Error('Status inválido');

    const beneficio = await this.beneficioRepository.findOne({
      where: { id: dto.beneficioId },
    });
    if (!beneficio) throw new Error('Benefício inválido');

    const processo = this.processosRepository.create({
      olhar_inss: dto.olhar_inss,
      olhar_pje_creta: dto.olhar_pje_creta,
      senha_inss: dto.senha_inss,
      data_atendimento: dto.data_atendimento,
      observacoes: dto.observacoes,
      data_ultima_atualizacao:
        dto.data_ultima_atualizacao || new Date().toISOString().split('T')[0],
      cliente: { id: clienteId },
      colaborador,
      status,
      beneficio,
    });

    const processoSalvo = await this.processosRepository.save(processo);
    if (file) {
      const nomeCliente = cliente.nome.replace(/\s+/g, '_');
      const dataAtendimento = dto.data_atendimento.replace(/-/g, '');
      const extensao = file.originalname.split('.').pop();
      const nomePersonalizado = `${nomeCliente}_${dataAtendimento}.${extensao}`;

      const arquivo = await this.arquivoService.salvarArquivo(
        file,
        nomePersonalizado,
      );
      processoSalvo.arquivo_documentos = arquivo;
      await this.processosRepository.save(processoSalvo);
    }

    return processoSalvo;
  }
  findAll() {
    return this.processosRepository.find({
      relations: [
        'cliente',
        'status',
        'beneficio',
        'arquivo_documentos',
        'colaborador',
      ],
    });
  }

  async findByCliente(clienteId: number) {
    return this.processosRepository.find({
      where: { cliente: { id: clienteId } },
      relations: [
        'cliente',
        'status',
        'beneficio',
        'cliente.endereco',
        'arquivo_documentos',
        'colaborador',
      ],
    });
  }
  findAllStatus() {
    return this.statusProcessoRepository.find().catch((e) => {
      console.error('Erro ao buscar status:', e);
      throw e;
    });
  }

  findOne(id: number) {
    return this.processosRepository.findOne({ where: { id } });
  }

  update(id: number, updateProcessoDto: UpdateProcessoDto) {
    const processo = this.processosRepository.create({
      id,
      ...updateProcessoDto,
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
      relations: ['cliente', 'arquivo_documentos'],
    });

    if (!processo) {
      throw new Error('Processo não encontrado');
    }

    const nomeCliente = processo.cliente.nome.replace(/\s+/g, '_');
    const dataAtendimento = processo.data_atendimento.replace(/-/g, '');
    const extensao = file.originalname.split('.').pop();
    const nomePersonalizado = `${nomeCliente}_${dataAtendimento}.${extensao}`;

    if (processo.arquivo_documentos) {
      await this.arquivoService.deletarArquivo(processo.arquivo_documentos.id);
    }

    const arquivo = await this.arquivoService.salvarArquivo(
      file,
      nomePersonalizado,
    );

    processo.arquivo_documentos = arquivo;
    return this.processosRepository.save(processo);
  }
}
