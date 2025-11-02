export class ColaboradorSimplificadoDto {
  id: number;
  nome: string;
  cargo: string;
}

export class ProcessoComColaboradorDto {
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
  colaborador: ColaboradorSimplificadoDto;
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
  endereco: any;
  processos: ProcessoComColaboradorDto[];
}
