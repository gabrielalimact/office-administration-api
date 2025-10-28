import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Relatorio } from './entities/relatorios.entity';
import { CreateRelatorioDto } from './dto/create-relatorio.dto';
import { Usuario } from '../usuario/entity/usuario.entity';

@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Relatorio)
    private readonly relatorioRepo: Repository<Relatorio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async criar(dto: CreateRelatorioDto) {
    const funcionario = await this.usuarioRepo.findOne({
      where: { id: dto.idFuncionario },
    });
    if (!funcionario) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    const rel = this.relatorioRepo.create({
      funcionario: {
        id: funcionario.id,
        nome: funcionario.nome,
        cargo: funcionario.cargo,
      },
      titulo: dto.titulo,
      conteudo: dto.conteudo,
    });
    return this.relatorioRepo.save(rel);
  }

  async listarPorFuncionario(idFuncionario: number) {
    const relatorios = await this.relatorioRepo.find({
      where: { funcionario: { id: idFuncionario } },
      order: { created_at: 'DESC' },
      relations: ['funcionario'],
    });
    return relatorios.map((rel) => ({
      ...rel,
      funcionario: {
        id: rel.funcionario.id,
        nome: rel.funcionario.nome,
        cargo: rel.funcionario.cargo,
      },
    }));
  }

  async listarTodos() {
    const relatorios = await this.relatorioRepo.find({
      order: { created_at: 'DESC' },
      relations: ['funcionario'],
    });
    return relatorios.map((rel) => ({
      ...rel,
      funcionario: {
        id: rel.funcionario.id,
        nome: rel.funcionario.nome,
        cargo: rel.funcionario.cargo,
      },
    }));
  }
}
