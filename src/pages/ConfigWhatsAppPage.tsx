import { useAppStore } from "@/stores/appStore";
import { MessageCircle, Phone, Globe, Key, Wifi, WifiOff, CheckCircle2, Save } from "lucide-react";

const statusIcon = {
  offline: WifiOff,
  online: Wifi,
  atestado: CheckCircle2,
};

const statusColor = {
  offline: "#ef4444",
  online: "#22c55e",
  atestado: "#3b82f6",
};

export default function ConfigWhatsAppPage() {
  const { whatsapp, updateWhatsapp } = useAppStore();
  const StatusIcon = statusIcon[whatsapp.status_conexao];

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    updateWhatsapp({
      webhook_url: form.get("webhook_url") as string,
      verify_token: form.get("verify_token") as string,
      numero_conectado: form.get("numero_conectado") as string,
      status_conexao: form.get("status_conexao") as "offline" | "online" | "atestado",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-500" />
          Conexão WhatsApp
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Configure o número do WhatsApp e as credenciais do webhook para integrar o WaHa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Número do WhatsApp</h3>
                <p className="text-xs text-text-muted">Número conectado ao WaHa</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Número (código do país + DDD + número)</label>
              <input
                name="numero_conectado"
                defaultValue={whatsapp.numero_conectado}
                placeholder="5511999990000"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Webhook URL (WaHa envia mensagens recebidas aqui)</label>
              <input
                name="webhook_url"
                defaultValue={whatsapp.webhook_url}
                placeholder="https://api.atendia.com/webhook/..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Token de Verificação do Webhook</label>
              <input
                name="verify_token"
                defaultValue={whatsapp.verify_token}
                type="password"
                placeholder="token_de_verificacao"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted block mb-1.5">Status da Conexão</label>
              <select
                name="status_conexao"
                defaultValue={whatsapp.status_conexao}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="atestado">Atestado</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Configuração
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: statusColor[whatsapp.status_conexao] + "20" }}>
                <StatusIcon className="w-5 h-5" style={{ color: statusColor[whatsapp.status_conexao] }} />
              </div>
              <div>
                <h3 className="font-semibold">Status da Conexão</h3>
                <p className="text-xs" style={{ color: statusColor[whatsapp.status_conexao] }}>
                  {whatsapp.status_conexao === "online"
                    ? "Online e recebendo mensagens"
                    : whatsapp.status_conexao === "atestado"
                    ? "Atestado e funcionando"
                    : "Desconectado"}
                </p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 space-y-1.5 text-xs font-mono">
              <p>
                <span className="text-text-muted">Número:</span>{" "}
                <span className="text-text">{whatsapp.numero_conectado}</span>
              </p>
              <p>
                <span className="text-text-muted">Webhook:</span>{" "}
                <span className="text-text break-all">{whatsapp.webhook_url}</span>
              </p>
              <p>
                <span className="text-text-muted">Última atualização:</span>{" "}
                <span className="text-text">{new Date(whatsapp.updated_at).toLocaleString("pt-BR")}</span>
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Servidor WaHa</h3>
                <p className="text-xs text-text-muted">Orquestrador de mensagens</p>
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 space-y-1.5 text-xs font-mono">
              <p>
                <span className="text-green-500">●</span> WaHa Online
              </p>
              <p>
                <span className="text-text-muted">Versão:</span>{" "}
                <span className="text-text">WaHa v0.1.0</span>
              </p>
              <p>
                <span className="text-text-muted">Fila de mensagens:</span>{" "}
                <span className="text-text">0 aguardando</span>
              </p>
              <p>
                <span className="text-text-muted">Conexão Supabase:</span>{" "}
                <span className="text-green-500">Ativa</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
