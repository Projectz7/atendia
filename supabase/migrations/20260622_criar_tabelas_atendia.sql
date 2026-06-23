-- Migration: Create AtendIA tables
-- Data: 2026-06-22
-- Descricao: Tabelas para o modulo de atendimento WhatsApp com IA

-- =============================================
-- ENUMS
-- =============================================

DO $$ BEGIN
  CREATE TYPE status_conversa AS ENUM ('ia_atendimento', 'ia_funcoes', 'humano', 'fechado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE tipo_contato_enum AS ENUM ('novo_lead', 'cliente_ativo', 'fornecedor_credor', 'outros');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- TABELA: conversas
-- =============================================

CREATE TABLE IF NOT EXISTS conversas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  whatsapp_numero text NOT NULL,
  cliente_nome text,
  status status_conversa DEFAULT 'ia_atendimento',
  tipo_contato tipo_contato_enum DEFAULT 'novo_lead',
  resumo_motivo text,
  ultima_mensagem text,
  ultimo_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_whatsapp_empresa UNIQUE (empresa_id, whatsapp_numero)
);

-- =============================================
-- TABELA: mensagens
-- =============================================

CREATE TABLE IF NOT EXISTS mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversa_id uuid NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  direcao text CHECK (direcao IN ('entrada', 'saida')) NOT NULL,
  tipo text CHECK (tipo IN ('texto', 'audio', 'imagem')) NOT NULL DEFAULT 'texto',
  conteudo text NOT NULL,
  texto_transcrito text,
  midia_url text,
  enviado_por text CHECK (enviado_por IN ('cliente', 'ia', 'humano')) NOT NULL,
  criado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_conversa ON mensagens(conversa_id, criado_em);

-- =============================================
-- TABELA: ia_configuracoes
-- =============================================

CREATE TABLE IF NOT EXISTS ia_configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  tipo text CHECK (tipo IN ('atendimento', 'funcoes')) NOT NULL,
  provedor text CHECK (provedor IN ('local', 'cloud')) NOT NULL DEFAULT 'local',
  modelo text NOT NULL,
  endpoint text NOT NULL,
  api_key text,
  system_prompt text NOT NULL DEFAULT 'Você é um assistente virtual amigável.',
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_empresa_tipo UNIQUE (empresa_id, tipo)
);

-- =============================================
-- TABELA: campanhas_disparos
-- =============================================

CREATE TABLE IF NOT EXISTS campanhas_disparos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  whatsapp_numero text NOT NULL,
  cliente_nome text,
  mensagem_base text NOT NULL,
  status text CHECK (status IN ('pendente', 'enviado', 'processando', 'falhou')) DEFAULT 'pendente',
  enviado_em timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- TABELA: tarefas_agendadas
-- =============================================

CREATE TABLE IF NOT EXISTS tarefas_agendadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  conversa_id uuid REFERENCES conversas(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  data_disparo timestamptz NOT NULL,
  status text CHECK (status IN ('pendente', 'enviado', 'cancelado', 'falhou')) DEFAULT 'pendente',
  executar_via_ia boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- TABELA: ferramentas_mcp
-- =============================================

CREATE TABLE IF NOT EXISTS ferramentas_mcp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text NOT NULL,
  categoria text CHECK (categoria IN ('consulta', 'acao')) NOT NULL,
  ativa boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (empresa_id, nome)
);

-- Inserir ferramentas MCP padrao para empresas existentes
INSERT INTO ferramentas_mcp (empresa_id, nome, descricao, categoria)
SELECT e.id, 'consultar_cliente', 'Busca dados de um cliente pelo nome ou telefone', 'consulta'
FROM empresa e
WHERE NOT EXISTS (SELECT 1 FROM ferramentas_mcp f WHERE f.empresa_id = e.id AND f.nome = 'consultar_cliente');

INSERT INTO ferramentas_mcp (empresa_id, nome, descricao, categoria)
SELECT e.id, 'criar_agendamento', 'Cria um novo agendamento de servico para um cliente', 'acao'
FROM empresa e
WHERE NOT EXISTS (SELECT 1 FROM ferramentas_mcp f WHERE f.empresa_id = e.id AND f.nome = 'criar_agendamento');

INSERT INTO ferramentas_mcp (empresa_id, nome, descricao, categoria)
SELECT e.id, 'consultar_servicos', 'Lista os servicos disponiveis cadastrados pela empresa', 'consulta'
FROM empresa e
WHERE NOT EXISTS (SELECT 1 FROM ferramentas_mcp f WHERE f.empresa_id = e.id AND f.nome = 'consultar_servicos');

INSERT INTO ferramentas_mcp (empresa_id, nome, descricao, categoria)
SELECT e.id, 'registrar_pedido', 'Registra um novo pedido ou venda no sistema', 'acao'
FROM empresa e
WHERE NOT EXISTS (SELECT 1 FROM ferramentas_mcp f WHERE f.empresa_id = e.id AND f.nome = 'registrar_pedido');

INSERT INTO ferramentas_mcp (empresa_id, nome, descricao, categoria)
SELECT e.id, 'cadastrar_cliente', 'Cadastra um novo cliente no banco de dados', 'acao'
FROM empresa e
WHERE NOT EXISTS (SELECT 1 FROM ferramentas_mcp f WHERE f.empresa_id = e.id AND f.nome = 'cadastrar_cliente');

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campanhas_disparos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas_agendadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas_mcp ENABLE ROW LEVEL SECURITY;

-- RLS Policies: usuario ve apenas registros da sua empresa
-- Nota: A funcao get_empresa_id_from_email() ja existe no schema do ServiFlux

CREATE POLICY select_own_empresa ON conversas FOR SELECT
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY insert_own_empresa ON conversas FOR INSERT
  WITH CHECK (empresa_id = get_empresa_id_from_email());

CREATE POLICY update_own_empresa ON conversas FOR UPDATE
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY select_own_empresa ON mensagens FOR SELECT
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY insert_own_empresa ON mensagens FOR INSERT
  WITH CHECK (empresa_id = get_empresa_id_from_email());

CREATE POLICY select_own_empresa ON ia_configuracoes FOR SELECT
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY insert_own_empresa ON ia_configuracoes FOR INSERT
  WITH CHECK (empresa_id = get_empresa_id_from_email());

CREATE POLICY update_own_empresa ON ia_configuracoes FOR UPDATE
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY select_own_empresa ON campanhas_disparos FOR ALL
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY insert_own_empresa ON campanhas_disparos FOR INSERT
  WITH CHECK (empresa_id = get_empresa_id_from_email());

CREATE POLICY select_own_empresa ON tarefas_agendadas FOR ALL
  USING (empresa_id = get_empresa_id_from_email());

CREATE POLICY insert_own_empresa ON tarefas_agendadas FOR INSERT
  WITH CHECK (empresa_id = get_empresa_id_from_email());

CREATE POLICY select_own_empresa ON ferramentas_mcp FOR ALL
  USING (empresa_id = get_empresa_id_from_email());

-- =============================================
-- REALTIME: Habilitar Realtime para as tabelas de chat
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE conversas;
ALTER PUBLICATION supabase_realtime ADD TABLE mensagens;

-- =============================================
-- TRIGGER: Atualizar ultimo_timestamp da conversa ao inserir mensagem
-- =============================================

CREATE OR REPLACE FUNCTION atualizar_conversao_ao_mensagem()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversas
  SET ultima_mensagem = NEW.conteudo,
      ultimo_timestamp = NEW.criado_em
  WHERE id = NEW.conversa_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_mensagem_atualiza_conversa ON mensagens;
CREATE TRIGGER trg_mensagem_atualiza_conversa
  AFTER INSERT ON mensagens
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_conversao_ao_mensagem();
