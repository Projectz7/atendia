import { create } from "zustand";
import type { Campanha, Tarefa, ConfigWhatsApp, MCPFerramenta } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface AppState {
  campanhas: Campanha[];
  tarefas: Tarefa[];
  whatsapp: ConfigWhatsApp;
  mcpFerramentas: MCPFerramenta[];
  loadingCampanhas: boolean;
  loadingTarefas: boolean;
  loadingMCP: boolean;

  carregarCampanhas: (empresaId: string) => Promise<void>;
  carregarTarefas: (empresaId: string) => Promise<void>;
  carregarMCP: (empresaId: string) => Promise<void>;
  addCampanha: (c: Campanha) => Promise<void>;
  updateCampanhaStatus: (id: string, status: Campanha["status"]) => Promise<void>;
  addTarefa: (t: Tarefa) => Promise<void>;
  updateTarefaStatus: (id: string, status: Tarefa["status"]) => Promise<void>;
  updateWhatsapp: (w: Partial<ConfigWhatsApp>) => void;
  toggleMCP: (id: string) => Promise<void>;
}

const hoje = new Date();

export const useAppStore = create<AppState>((set, get) => ({
  campanhas: [],
  tarefas: [],
  whatsapp: {
    webhook_url: "https://api.atendia.com/webhook/",
    verify_token: "atendia_verify_token",
    numero_conectado: "5511999990000",
    status_conexao: "offline",
    updated_at: hoje.toISOString(),
  },
  mcpFerramentas: [],
  loadingCampanhas: false,
  loadingTarefas: false,
  loadingMCP: false,

  carregarCampanhas: async (empresaId) => {
    set({ loadingCampanhas: true });
    try {
      const { data } = await supabase.from("campanhas_disparos").select("*").eq("empresa_id", empresaId).order("created_at", { ascending: false });
      if (data && data.length > 0) set({ campanhas: data as Campanha[] });
    } catch { /* fallback mock vazio */ }
    set({ loadingCampanhas: false });
  },

  carregarTarefas: async (empresaId) => {
    set({ loadingTarefas: true });
    try {
      const { data } = await supabase.from("tarefas_agendadas").select("*").eq("empresa_id", empresaId).order("data_disparo", { ascending: false });
      if (data && data.length > 0) set({ tarefas: data as Tarefa[] });
    } catch { /* fallback mock vazio */ }
    set({ loadingTarefas: false });
  },

  carregarMCP: async (empresaId) => {
    set({ loadingMCP: true });
    try {
      const { data } = await supabase.from("ferramentas_mcp").select("*").eq("empresa_id", empresaId);
      if (data && data.length > 0) {
        set({ mcpFerramentas: data as MCPFerramenta[] });
      } else {
        set({
          mcpFerramentas: [
            { id: "mcp-1", nome: "consultar_cliente", descricao: "Busca dados de um cliente pelo nome ou telefone", ativa: true, categoria: "consulta" },
            { id: "mcp-2", nome: "criar_agendamento", descricao: "Cria um novo agendamento de serviço", ativa: true, categoria: "acao" },
            { id: "mcp-3", nome: "consultar_servicos", descricao: "Lista os serviços disponíveis", ativa: true, categoria: "consulta" },
            { id: "mcp-4", nome: "registrar_pedido", descricao: "Registra um novo pedido", ativa: false, categoria: "acao" },
            { id: "mcp-5", nome: "cadastrar_cliente", descricao: "Cadastra um novo cliente", ativa: true, categoria: "acao" },
          ],
        });
      }
    } catch {
      set({
        mcpFerramentas: [
          { id: "mcp-1", nome: "consultar_cliente", descricao: "Busca dados de um cliente pelo nome ou telefone", ativa: true, categoria: "consulta" },
          { id: "mcp-2", nome: "criar_agendamento", descricao: "Cria um novo agendamento de serviço", ativa: true, categoria: "acao" },
          { id: "mcp-3", nome: "consultar_servicos", descricao: "Lista os serviços disponíveis", ativa: true, categoria: "consulta" },
          { id: "mcp-4", nome: "registrar_pedido", descricao: "Registra um novo pedido", ativa: false, categoria: "acao" },
          { id: "mcp-5", nome: "cadastrar_cliente", descricao: "Cadastra um novo cliente", ativa: true, categoria: "acao" },
        ],
      });
    }
    set({ loadingMCP: false });
  },

  addCampanha: async (campanha) => {
    set((s) => ({ campanhas: [campanha, ...s.campanhas] }));
    try {
      await supabase.from("campanhas_disparos").insert({
        empresa_id: campanha.empresa_id,
        whatsapp_numero: campanha.whatsapp_numero,
        cliente_nome: campanha.cliente_nome,
        mensagem_base: campanha.mensagem_base,
      });
    } catch { /* fallback local */ }
  },

  updateCampanhaStatus: async (id, status) => {
    set((s) => ({
      campanhas: s.campanhas.map((c) =>
        c.id === id ? { ...c, status, enviado_em: status === "enviado" ? new Date().toISOString() : c.enviado_em } : c
      ),
    }));
    try {
      await supabase.from("campanhas_disparos").update({ status }).eq("id", id);
    } catch { /* fallback local */ }
  },

  addTarefa: async (tarefa) => {
    set((s) => ({ tarefas: [tarefa, ...s.tarefas] }));
    try {
      await supabase.from("tarefas_agendadas").insert({
        empresa_id: tarefa.empresa_id,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        data_disparo: tarefa.data_disparo,
        executar_via_ia: tarefa.executar_via_ia,
      });
    } catch { /* fallback local */ }
  },

  updateTarefaStatus: async (id, status) => {
    set((s) => ({
      tarefas: s.tarefas.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    try {
      await supabase.from("tarefas_agendadas").update({ status }).eq("id", id);
    } catch { /* fallback local */ }
  },

  updateWhatsapp: (w) =>
    set((s) => ({ whatsapp: { ...s.whatsapp, ...w, updated_at: new Date().toISOString() } })),

  toggleMCP: async (id) => {
    const ferramenta = get().mcpFerramentas.find((m) => m.id === id);
    if (!ferramenta) return;
    const novoEstado = !ferramenta.ativa;
    set((s) => ({
      mcpFerramentas: s.mcpFerramentas.map((m) => (m.id === id ? { ...m, ativa: novoEstado } : m)),
    }));
    try {
      await supabase.from("ferramentas_mcp").update({ ativa: novoEstado }).eq("id", id);
    } catch { /* fallback local */ }
  },
}));
