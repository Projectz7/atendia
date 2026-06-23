import type { Mensagem } from "@/types/database";
import { Bot, User, MessageCircle } from "lucide-react";

interface Props {
  mensagem: Mensagem;
}

const agentConfig: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  ia: { icon: Bot, color: "var(--color-ia)", label: "IA" },
  humano: { icon: User, color: "var(--color-humano)", label: "Você" },
  cliente: { icon: MessageCircle, color: "var(--color-cliente)", label: "Cliente" },
};

export function ChatMessage({ mensagem }: Props) {
  const agent = agentConfig[mensagem.enviado_por] ?? agentConfig.cliente;
  const isCliente = mensagem.enviado_por === "cliente";
  const Icon = agent.icon;

  return (
    <div className={`flex gap-3 ${isCliente ? "" : "flex-row-reverse"}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: agent.color + "20" }}
      >
        <Icon className="w-4 h-4" style={{ color: agent.color }} />
      </div>

      <div className={`max-w-[75%] ${isCliente ? "" : "items-end flex flex-col"}`}>
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isCliente ? "var(--color-surface)" : agent.color + "15",
            color: "var(--color-text)",
            borderBottomLeftRadius: isCliente ? "4px" : "1rem",
            borderBottomRightRadius: isCliente ? "1rem" : "4px",
          }}
        >
          {mensagem.conteudo}
        </div>
        <span className="text-[10px] text-text-muted mt-1">
          {mensagem.enviado_por === "cliente"
            ? "Cliente"
            : agent.label}
        </span>
      </div>
    </div>
  );
}
