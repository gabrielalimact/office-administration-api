export class FuncionarioSimplificadoDto {
  id: number;
  nome: string;
  cargo: string;
}

export class ProcessoComFuncionarioDto {
  id: number;
  status: any;
  beneficio: any;
  arquivado: boolean;
  olhar_inss: boolean;
  olhar_pje_creta: boolean;
  senha_inss: string;
  data_cadastro: string;
  data_ultima_atualizacao: string;
  observacoes: string;
  arquivo_documentos: any;
  funcionario: FuncionarioSimplificadoDto;
}

export class ClienteComProcessosDto {
  id: number;
  nome: string;
  email: string;
  data_nascimento: string;
  cpf: string;
  rg: string;
  filiacao: string;
  naturalidade: string;
  telefone: string;
  endereco: any;
  processos: ProcessoComFuncionarioDto[];
}
