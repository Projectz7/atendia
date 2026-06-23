import { create } from "zustand";
import type { IAConfiguracao } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface IAConfigState {
  configAtendimento: IAConfiguracao | null;
  configFuncoes: IAConfiguracao | null;
  loading: boolean;
  saving: boolean;

  loadConfigs: (empresaId: string) => Promise<void>;
  saveConfig: (tipo: "atendimento" | "funcoes", campos: Partial<IAConfiguracao>) => Promise<void>;
}

const configPadrao: IAConfiguracao = {
  id: "",
  empresa_id: "emp-1",
  tipo: "atendimento",
  provedor: "local",
  modelo: "llama3.2",
  endpoint: "http://localhost:11434",
  api_key: null,
  system_prompt: "Você é um atendente virtual amigável e profissional de uma empresa de serviços. Seu objetivo é entender a necessidade do cliente, coletar informações básicas (nome, endereço, serviço desejado) e depois transferir para um atendente humano. Seja educado e objetivo.",
  ativo: true,
  created_at: new Date().toISOString(),
};

export const useIAConfigStore = create<IAConfigState>((set, get) => ({
  configAtendimento: null,
  configFuncoes: null,
  loading: false,
  saving: false,

  loadConfigs: async (empresaId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("ia_configuracoes")
        .select("*")
        .eq("empresa_id", empresaId);
      if (error) throw error;

      if (data && data.length > 0) {
        set({
          configAtendimento: data.find((c) => c.tipo === "atendimento") ?? { ...configPadrao, tipo: "atendimento" },
          configFuncoes: data.find((c) => c.tipo === "funcoes") ?? { ...configPadrao, tipo: "funcoes", id: "func-fallback" },
        });
      } else {
        set({
          configAtendimento: { ...configPadrao, id: "mock-atend-1" },
          configFuncoes: { ...configPadrao, id: "mock-func-1", tipo: "funcoes", modelo: "phi-3.5", system_prompt: "Você é um assistente de backoffice especializado em executar funções no sistema." },
        });
      }
    } catch {
      set({
        configAtendimento: { ...configPadrao, id: "mock-atend-1" },
        configFuncoes: { ...configPadrao, id: "mock-func-1", tipo: "funcoes" },
      });
    }
    set({ loading: false });
  },

  saveConfig: async (tipo, campos) => {
    set({ saving: true });
    const config = tipo === "atendimento" ? get().configAtendimento : get().configFuncoes;
    const empresaId = config?.empresa_id || "emp-1";

    try {
      const payload = { empresa_id: empresaId, tipo, ...campos };
      if (config?.id && !config.id.startsWith("mock-")) {
        await supabase.from("ia_configuracoes").update(payload).eq("id", config.id);
      } else {
        const { data } = await supabase.from("ia_configuracoes").insert(payload).select().single();
        if (data) campos = { ...campos, id: data.id };
      }
    } catch {
      // fallback local
    }

    await get().loadConfigs(empresaId);
    set({ saving: false });
  },
}));
