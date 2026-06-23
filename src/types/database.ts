export type StatusConversa = "ia_atendimento" | "ia_funcoes" | "humano" | "fechado";
export type TipoContato = "novo_lead" | "cliente_ativo" | "fornecedor_credor" | "outros";

export interface Conversa {
  id: string;
  empresa_id: string;
  whatsapp_numero: string;
  cliente_nome: string;
  status: StatusConversa;
  tipo_contato: TipoContato;
  resumo_motivo: string | null;
  ultima_mensagem: string | null;
  ultimo_timestamp: string | null;
  created_at: string;
}

export interface Mensagem {
  id: string;
  conversa_id: string;
  empresa_id: string;
  direcao: "entrada" | "saida";
  tipo: "texto" | "audio" | "imagem";
  conteudo: string;
  texto_transcrito: string | null;
  midia_url: string | null;
  enviado_por: "cliente" | "ia" | "humano";
  criado_em: string;
}

export interface IAConfiguracao {
  id: string;
  empresa_id: string;
  tipo: "atendimento" | "funcoes";
  provedor: "local" | "cloud";
  modelo: string;
  endpoint: string;
  api_key: string | null;
  system_prompt: string;
  ativo: boolean;
  created_at: string;
}

export interface Campanha {
  id: string;
  empresa_id: string;
  whatsapp_numero: string;
  cliente_nome: string;
  mensagem_base: string;
  status: "pendente" | "enviado" | "processando" | "falhou";
  enviado_em: string | null;
  created_at: string;
}

export interface Tarefa {
  id: string;
  empresa_id: string;
  conversa_id: string | null;
  titulo: string;
  descricao: string;
  data_disparo: string;
  status: "pendente" | "enviado" | "cancelado" | "falhou";
  executar_via_ia: boolean;
  created_at: string;
}

export interface ConfigWhatsApp {
  webhook_url: string;
  verify_token: string;
  numero_conectado: string;
  status_conexao: "offline" | "online" | "atestado";
  updated_at: string;
}

export interface MCPFerramenta {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  categoria: "consulta" | "acao";
}
