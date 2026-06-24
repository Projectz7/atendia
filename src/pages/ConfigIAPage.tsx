import { useEffect } from "react";
import { useIAConfigStore } from "@/stores/iaConfigStore";
import { useToastStore } from "@/stores/toastStore";
import { Sparkles, Wrench, Save, Loader2 } from "lucide-react";
import type { IAConfiguracao } from "@/types/database";

const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "default";

function ConfigCard({
  titulo, descricao, icon: Icon, cor, config, saving, onUpdate,
}: {
  titulo: string; descricao: string; icon: typeof Sparkles; cor: string;
  config: IAConfiguracao | null; saving: boolean; onUpdate: (campos: Partial<IAConfiguracao>) => Promise<void>;
}) {
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await onUpdate({
        provedor: form.get("provedor") as "local" | "cloud",
        modelo: form.get("modelo") as string,
        endpoint: form.get("endpoint") as string,
        api_key: (form.get("api_key") as string) || null,
        system_prompt: form.get("system_prompt") as string,
        ativo: form.get("ativo") === "on",
      });
      addToast("success", `${titulo} salva com sucesso!`);
    } catch {
      addToast("error", `Erro ao salvar ${titulo.toLowerCase()}`);
    }
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
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: cor + "20", color: cor }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Salvando..." : "Salvar Configuração"}
        </button>
      </form>
    </div>
  );
}

export default function ConfigIAPage() {
  const { configAtendimento, configFuncoes, loadConfigs, saveConfig, loading, saving } = useIAConfigStore();

  useEffect(() => { loadConfigs(EMPRESA_ID); }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <div className="h-7 w-64 bg-surface rounded animate-pulse" />
          <div className="h-4 w-96 bg-surface rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-5 space-y-4">
              <div className="h-10 w-48 bg-surface-hover rounded animate-pulse" />
              <div className="h-8 w-full bg-surface-hover rounded animate-pulse" />
              <div className="h-8 w-full bg-surface-hover rounded animate-pulse" />
              <div className="h-24 w-full bg-surface-hover rounded animate-pulse" />
            </div>
          ))}
        </div>
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
          titulo="IA de Atendimento"
          descricao="Responde mensagens dos clientes, segue o roteiro de vendas"
          icon={Sparkles} cor="#a855f7" config={configAtendimento} saving={saving}
          onUpdate={(campos) => saveConfig("atendimento", campos)}
        />
        <ConfigCard
          titulo="IA de Funções"
          descricao="Agenda serviços, cadastra clientes, registra pedidos"
          icon={Wrench} cor="#f59e0b" config={configFuncoes} saving={saving}
          onUpdate={(campos) => saveConfig("funcoes", campos)}
        />
      </div>
    </div>
  );
}
