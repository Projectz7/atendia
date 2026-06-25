import { useState, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { useToastStore } from "@/stores/toastStore";
import {
  Calendar,
  Plus,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Loader2,
} from "lucide-react";

const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "default";

type FiltroStatus = "todas" | "pendente" | "enviado" | "cancelado" | "falhou";

export default function TarefasPage() {
  const { tarefas, carregarTarefas, addTarefa, updateTarefaStatus, loadingTarefas } = useAppStore();
  const { addToast } = useToastStore();
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [mostrarNova, setMostrarNova] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { carregarTarefas(EMPRESA_ID); }, []);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novaIa, setNovaIa] = useState(true);

  const filtradas = filtro === "todas" ? tarefas : tarefas.filter((t) => t.status === filtro);

  const handleNovaTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaData) return;
    setSubmitting(true);
    try {
      await addTarefa({
        id: `tar-${Date.now()}`,
        empresa_id: EMPRESA_ID,
        conversa_id: null,
        titulo: novoTitulo,
        descricao: novaDescricao,
        data_disparo: new Date(novaData).toISOString(),
        status: "pendente",
        executar_via_ia: novaIa,
        created_at: new Date().toISOString(),
      });
      addToast("success", "Tarefa agendada com sucesso!");
      setNovoTitulo("");
      setNovaDescricao("");
      setNovaData("");
      setNovaIa(true);
      setMostrarNova(false);
    } catch {
      addToast("error", "Erro ao agendar tarefa");
    }
    setSubmitting(false);
  };

  const handleStatus = async (id: string, status: "enviado" | "cancelado") => {
    try {
      await updateTarefaStatus(id, status);
      addToast("success", `Tarefa ${status === "enviado" ? "concluída" : "cancelada"}`);
    } catch {
      addToast("error", "Erro ao atualizar tarefa");
    }
  };

  const statusConfig = {
    pendente: { icon: Clock, color: "#f59e0b", label: "Pendente" },
    enviado: { icon: CheckCircle2, color: "#22c55e", label: "Concluído" },
    cancelado: { icon: XCircle, color: "#94a3b8", label: "Cancelado" },
    falhou: { icon: XCircle, color: "#ef4444", label: "Falhou" },
  };

  function formatarData(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loadingTarefas) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="h-7 w-48 bg-surface rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4">
              <div className="h-5 w-40 bg-surface-hover rounded animate-pulse mb-2" />
              <div className="h-4 w-56 bg-surface-hover rounded animate-pulse mb-2" />
              <div className="h-3 w-32 bg-surface-hover rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Tarefas Agendadas
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Agende lembretes e ações que podem ser executadas pela IA automaticamente.
            </p>
          </div>
          <button
            onClick={() => setMostrarNova(!mostrarNova)}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {mostrarNova && (
        <form
          onSubmit={handleNovaTarefa}
          className="bg-surface rounded-xl border border-border p-5 mb-6"
        >
          <h3 className="font-medium mb-4">Nova Tarefa</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Título</label>
              <input
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Ex: Confirmar agendamento com cliente"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1.5">Descrição</label>
              <textarea
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                rows={2}
                placeholder="Detalhes da tarefa..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Data de disparo</label>
                <input
                  type="datetime-local"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1.5">Executar via IA?</label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setNovaIa(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={novaIa ? { background: "color-mix(in srgb, var(--color-ia) 20%, transparent)", color: "var(--color-ia)" } : {}}>
                    <Bell className="w-4 h-4" />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovaIa(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                    style={!novaIa ? { background: "color-mix(in srgb, var(--color-humano) 20%, transparent)", color: "var(--color-humano)" } : {}}>
                    <BellOff className="w-4 h-4" />
                    Não (manual)
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Agendar Tarefa
              </button>
              <button
                type="button"
                onClick={() => setMostrarNova(false)}
                className="px-4 py-2 bg-surface-hover text-text-muted rounded-lg text-sm font-medium hover:bg-border transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-text-muted" />
        {(["todas", "pendente", "enviado", "cancelado", "falhou"] as FiltroStatus[]).map(
          (f) => (
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
                ? "Concluídas"
                : f === "cancelado"
                ? "Canceladas"
                : "Falhas"}
            </button>
          )
        )}
      </div>

      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma tarefa encontrada</p>
            <p className="text-xs mt-1">Clique em "Nova Tarefa" para criar uma</p>
          </div>
        ) : (
          filtradas.map((tarefa) => {
            const st = statusConfig[tarefa.status] ?? statusConfig.pendente;
            const Icon = st.icon;
            return (
              <div
                key={tarefa.id}
                className="bg-surface rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{tarefa.titulo}</span>
                      {tarefa.executar_via_ia ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "color-mix(in srgb, var(--color-ia) 20%, transparent)", color: "var(--color-ia)" }}>
                          🤖 IA
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "color-mix(in srgb, var(--color-humano) 20%, transparent)", color: "var(--color-humano)" }}>
                          👤 Manual
                        </span>
                      )}
                    </div>
                    {tarefa.descricao && (
                      <p className="text-sm text-text-muted mb-2">{tarefa.descricao}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatarData(tarefa.data_disparo)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {tarefa.status === "pendente" && (
                      <>
                        <button
                          onClick={() => handleStatus(tarefa.id, "enviado")}
                          className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                          title="Marcar como concluído"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatus(tarefa.id, "cancelado")}
                          className="p-2 rounded-lg bg-text-muted/20 text-text-muted hover:bg-text-muted/30 transition-colors"
                          title="Cancelar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ background: st.color + "20", color: st.color }}
                    >
                      <Icon className="w-3 h-3" />
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
