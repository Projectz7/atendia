import { create } from "zustand";
import type { Conversa, Mensagem } from "@/types/database";
import { supabase } from "@/lib/supabase";

// Mock data fallback
const mockConversas: Conversa[] = [
  {
    id: "conv-1", empresa_id: "emp-1", whatsapp_numero: "5511999990001",
    cliente_nome: "João Silva", status: "ia_atendimento", tipo_contato: "novo_lead",
    resumo_motivo: "Orçamento para instalação de ar-condicionado",
    ultima_mensagem: "Qual o prazo de instalação?",
    ultimo_timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "conv-2", empresa_id: "emp-1", whatsapp_numero: "5511999990002",
    cliente_nome: "Maria Souza", status: "humano", tipo_contato: "cliente_ativo",
    resumo_motivo: "Agendar visita técnica para manutenção",
    ultima_mensagem: "Pode vir na quinta-feira?",
    ultimo_timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "conv-3", empresa_id: "emp-1", whatsapp_numero: "5511999990003",
    cliente_nome: "Carlos Oliveira", status: "ia_funcoes", tipo_contato: "fornecedor_credor",
    resumo_motivo: "Nota fiscal de materiais",
    ultima_mensagem: "Segue anexo a NF 1234",
    ultimo_timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

interface ChatState {
  conversas: Conversa[];
  conversaAtiva: Conversa | null;
  mensagens: Mensagem[];
  loading: boolean;
  usandoMock: boolean;

  setConversas: (conversas: Conversa[]) => void;
  setConversaAtiva: (conversa: Conversa | null) => void;
  setMensagens: (mensagens: Mensagem[]) => void;
  addMensagem: (mensagem: Mensagem) => void;
  updateConversaStatus: (conversaId: string, status: Conversa["status"]) => void;
  enviarMensagem: (conversaId: string, texto: string, enviadoPor: "ia" | "humano") => Promise<void>;
  carregarConversas: (empresaId: string) => Promise<void>;
  carregarMensagens: (conversaId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversas: [],
  conversaAtiva: null,
  mensagens: [],
  loading: false,
  usandoMock: false,

  setConversas: (conversas) => set({ conversas }),
  setConversaAtiva: (conversa) => {
    set({ conversaAtiva: conversa });
    if (conversa) get().carregarMensagens(conversa.id);
    else set({ mensagens: [] });
  },
  setMensagens: (mensagens) => set({ mensagens }),
  addMensagem: (mensagem) =>
    set((state) => ({ mensagens: [...state.mensagens, mensagem] })),
  updateConversaStatus: (conversaId, status) =>
    set((state) => ({
      conversas: state.conversas.map((c) =>
        c.id === conversaId ? { ...c, status } : c
      ),
      conversaAtiva:
        state.conversaAtiva?.id === conversaId
          ? { ...state.conversaAtiva, status }
          : state.conversaAtiva,
    })),

  carregarConversas: async (empresaId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("conversas")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("ultimo_timestamp", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        set({ conversas: data as Conversa[], usandoMock: false });
      } else {
        set({ conversas: mockConversas, usandoMock: true });
      }
    } catch {
      set({ conversas: mockConversas, usandoMock: true });
    }
    set({ loading: false });
  },

  carregarMensagens: async (conversaId) => {
    try {
      const { data, error } = await supabase
        .from("mensagens")
        .select("*")
        .eq("conversa_id", conversaId)
        .order("criado_em", { ascending: true });
      if (error) throw error;
      if (data) set({ mensagens: data as Mensagem[] });
    } catch {
      set({ mensagens: [] });
    }
  },

  enviarMensagem: async (conversaId, texto, enviadoPor) => {
    const state = get();
    const empresaId = state.conversas.find((c) => c.id === conversaId)?.empresa_id || "emp-1";

    const msg: Mensagem = {
      id: `msg-${Date.now()}`,
      conversa_id: conversaId,
      empresa_id: empresaId,
      direcao: "saida",
      tipo: "texto",
      conteudo: texto,
      texto_transcrito: null,
      midia_url: null,
      enviado_por: enviadoPor,
      criado_em: new Date().toISOString(),
    };

    // Salva no Supabase se nao estiver em modo mock
    if (!state.usandoMock) {
      try {
        await supabase.from("mensagens").insert({
          conversa_id: conversaId,
          empresa_id: empresaId,
          direcao: "saida",
          tipo: "texto",
          conteudo: texto,
          enviado_por: enviadoPor,
        });
      } catch {
        // fallback local
      }
    }

    set((state) => ({
      mensagens: [...state.mensagens, msg],
      conversas: state.conversas.map((c) =>
        c.id === conversaId
          ? { ...c, ultima_mensagem: texto, ultimo_timestamp: new Date().toISOString() }
          : c
      ),
      conversaAtiva:
        state.conversaAtiva?.id === conversaId
          ? { ...state.conversaAtiva, ultima_mensagem: texto, ultimo_timestamp: new Date().toISOString() }
          : state.conversaAtiva,
    }));
  },
}));
