import type { Conversa } from "@/types/database";
import { Bot, Wrench, User, Circle, MessageSquare } from "lucide-react";

interface Props {
  conversa: Conversa;
  ativa: boolean;
  onClick: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Bot }> = {
  ia_atendimento: { label: "IA Atendimento", color: "var(--color-ia)", icon: Bot },
  ia_funcoes: { label: "IA Funções", color: "#f59e0b", icon: Wrench },
  humano: { label: "Humano", color: "var(--color-humano)", icon: User },
  fechado: { label: "Fechado", color: "var(--color-text-muted)", icon: MessageSquare },
};

const tipoContatoConfig: Record<string, { label: string; color: string }> = {
  novo_lead: { label: "Novo Lead", color: "#22c55e" },
  cliente_ativo: { label: "Cliente Ativo", color: "#3b82f6" },
  fornecedor_credor: { label: "Fornecedor", color: "#ef4444" },
  outros: { label: "Outros", color: "#94a3b8" },
};

function formatarData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const agora = new Date();
  const diff = agora.getTime() - d.getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(diff / 3600000);
  if (horas < 24) return `${horas}h`;
  return d.toLocaleDateString("pt-BR");
}

export function ConversaCard({ conversa, ativa, onClick }: Props) {
  const st = statusConfig[conversa.status] ?? statusConfig.ia_atendimento;
  const tc = tipoContatoConfig[conversa.tipo_contato] ?? tipoContatoConfig.outros;
  const Icon = st.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all ${
        ativa
          ? "bg-primary/10 border border-primary/30"
          : "bg-surface hover:bg-surface-hover border border-transparent"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{conversa.cliente_nome}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
              style={{ background: `color-mix(in srgb, ${st.color} 20%, transparent)`, color: st.color }}
            >
              {st.label}
            </span>
          </div>

          {conversa.resumo_motivo && (
            <p className="text-xs mt-1 font-medium truncate" style={{ color: tc.color }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ background: tc.color }}
              />
              {conversa.resumo_motivo}
              <span className="text-[10px] ml-1 opacity-70">({tc.label})</span>
            </p>
          )}

          {conversa.ultima_mensagem && (
            <p className="text-sm text-text-muted truncate mt-1">
              {conversa.ultima_mensagem}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-text-muted">
              {formatarData(conversa.ultimo_timestamp)}
            </span>
            {conversa.status !== "fechado" && (
              <Circle className="w-1.5 h-1.5 fill-green-500 text-green-500" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
