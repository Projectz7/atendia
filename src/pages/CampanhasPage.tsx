import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "default";
import {
  Send,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Filter,
  Search,
} from "lucide-react";

type FiltroStatus = "todas" | "pendente" | "enviado" | "falhou";

export default function CampanhasPage() {
  const { campanhas, addCampanha, updateCampanhaStatus } = useAppStore();
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [mostrarNovo, setMostrarNovo] = useState(false);

  useEffect(() => { carregarCampanhas(EMPRESA_ID); }, []);
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaMensagem, setNovaMensagem] = useState("");

  const filtradas = filtro === "todas" ? campanhas : campanhas.filter((c) => c.status === filtro);

  const handleNovoDisparo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNumero.trim() || !novaMensagem.trim()) return;
    addCampanha({
      id: `cmp-${Date.now()}`,
      empresa_id: "emp-1",
      whatsapp_numero: novoNumero,
      cliente_nome: novoNome || "Desconhecido",
      mensagem_base: novaMensagem,
      status: "pendente",
      enviado_em: null,
      created_at: new Date().toISOString(),
    });
    setNovoNumero("");
    setNovoNome("");
    setNovaMensagem("");
    setMostrarNovo(false);
  };

  const statusConfig = {
    pendente: { icon: Clock, color: "#f59e0b", label: "Pendente" },
    processando: { icon: Loader2, color: "#3b82f6", label: "Processando" },
    enviado: { icon: CheckCircle2, color: "#22c55e", label: "Enviado" },
    falhou: { icon: XCircle, color: "#ef4444", label: "Falhou" },
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Campanhas de Disparo
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Dispare mensagens em lote com delay anti-spam automático.
            </p>
          </div>
          <button
            onClick={() => setMostrarNovo(!mostrarNovo)}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Disparo
          </button>
        </div>
      </div>

      {mostrarNovo && (
        <form
          onSubmit={handleNovoDisparo}
          className="bg-surface rounded-xl border border-border p-5 mb-6"
        >
          <h3 className="font-medium mb-4">Novo Disparo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Número do WhatsApp</label>
              <input
                value={novoNumero}
                onChange={(e) => setNovoNumero(e.target.value)}
                placeholder="5511999990000"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Nome do Cliente</label>
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="João Silva"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs text-text-muted block mb-1.5">Mensagem</label>
            <textarea
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              rows={3}
              placeholder="Digite a mensagem do disparo..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              Adicionar à Fila
            </button>
            <button
              type="button"
              onClick={() => setMostrarNovo(false)}
              className="px-4 py-2 bg-surface-hover text-text-muted rounded-lg text-sm font-medium hover:bg-border transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-text-muted" />
        {(["todas", "pendente", "enviado", "falhou"] as FiltroStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              filtro === f
                ? "bg-primary/20 text-primary"
                : "bg-surface text-text-muted hover:bg-surface-hover"
            }`}
          >
            {f === "todas"
              ? "Todas"
              : f === "pendente"
              ? "Pendentes"
              : f === "enviado"
              ? "Enviadas"
              : "Falhas"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma campanha encontrada</p>
            <p className="text-xs mt-1">Clique em "Novo Disparo" para criar uma</p>
          </div>
        ) : (
          filtradas.map((campanha) => {
            const st = statusConfig[campanha.status] ?? statusConfig.pendente;
            const Icon = st.icon;
            return (
              <div
                key={campanha.id}
                className="bg-surface rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{campanha.cliente_nome}</span>
                      <span className="text-xs text-text-muted">
                        ({campanha.whatsapp_numero})
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mb-2">{campanha.mensagem_base}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {campanha.created_at
                          ? new Date(campanha.created_at).toLocaleDateString("pt-BR")
                          : "-"}
                      </span>
                      {campanha.enviado_em && (
                        <span>
                          Enviado: {new Date(campanha.enviado_em).toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {campanha.status === "pendente" && (
                      <button
                        onClick={() => updateCampanhaStatus(campanha.id, "enviado")}
                        className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                        title="Marcar como enviado"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {campanha.status === "pendente" && (
                      <button
                        onClick={() => updateCampanhaStatus(campanha.id, "falhou")}
                        className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                        title="Marcar como falha"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ background: st.color + "20", color: st.color }}
                    >
                      {st.icon === Loader2 ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Icon className="w-3 h-3" />
                      )}
                      {st.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
