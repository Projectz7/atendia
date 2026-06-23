import { useEffect } from "react";
import { useIAConfigStore } from "@/stores/iaConfigStore";
import { Sparkles, Wrench, Save } from "lucide-react";
import type { IAConfiguracao } from "@/types/database";

const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "default";

function ConfigCard({
  titulo, descricao, icon: Icon, cor, config, onUpdate,
}: {
  titulo: string; descricao: string; icon: typeof Sparkles; cor: string;
  config: IAConfiguracao | null; onUpdate: (campos: Partial<IAConfiguracao>) => void;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onUpdate({
      provedor: form.get("provedor") as "local" | "cloud",
      modelo: form.get("modelo") as string,
      endpoint: form.get("endpoint") as string,
      api_key: (form.get("api_key") as string) || null,
      system_prompt: form.get("system_prompt") as string,
      ativo: form.get("ativo") === "on",
    });
  };

  if (!config) return null;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border" style={{ borderColor: cor + "30" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: cor + "20" }}>
            <Icon className="w-5 h-5" style={{ color: cor }} />
          </div>
          <div>
            <h3 className="font-semibold">{titulo}</h3>
            <p className="text-xs text-text-muted">{descricao}</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="ativo" defaultChecked={config.ativo} className="sr-only peer" />
            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
          </label>
          <span className="text-sm">{config.ativo ? "Ativa" : "Inativa"}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Provedor</label>
            <select name="provedor" defaultValue={config.provedor} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="local">Local (Ollama/LMStudio)</option>
              <option value="cloud">Cloud (OpenAI/DeepSeek)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1.5">Modelo</label>
            <input name="modelo" defaultValue={config.modelo} placeholder="llama3.2, gpt-4o" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1.5">Endpoint</label>
          <input name="endpoint" defaultValue={config.endpoint} placeholder="http://localhost:11434" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1.5">API Key (apenas Cloud)</label>
          <input name="api_key" defaultValue={config.api_key || ""} type="password" placeholder="sk-..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1.5">System Prompt</label>
          <textarea name="system_prompt" defaultValue={config.system_prompt} rows={5} placeholder="Você é um atendente virtual..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none font-mono text-xs leading-relaxed" />
        </div>
        <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2" style={{ background: cor + "20", color: cor }}>
          <Save className="w-4 h-4" /> Salvar Configuração
        </button>
      </form>
    </div>
  );
}

export default function ConfigIAPage() {
  const { configAtendimento, configFuncoes, loadConfigs, saveConfig, loading } = useIAConfigStore();

  useEffect(() => { loadConfigs(EMPRESA_ID); }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Configuração das IAs
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Configure duas IAs separadas: a <strong>IA de Atendimento</strong> conversa com os clientes e segue o roteiro.
          A <strong>IA de Funções</strong> executa ações como agendar, cadastrar e consultar dados.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigCard
          tipo="atendimento" titulo="IA de Atendimento"
          descricao="Responde mensagens dos clientes, segue o roteiro de vendas"
          icon={Sparkles} cor="#a855f7" config={configAtendimento}
          onUpdate={(campos) => saveConfig("atendimento", campos)}
        />
        <ConfigCard
          tipo="funcoes" titulo="IA de Funções"
          descricao="Agenda serviços, cadastra clientes, registra pedidos"
          icon={Wrench} cor="#f59e0b" config={configFuncoes}
          onUpdate={(campos) => saveConfig("funcoes", campos)}
        />
      </div>
    </div>
  );
}
