import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { ConversaCard } from "@/components/ConversaCard";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MessageSquare, Bot, Search } from "lucide-react";

const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "default";

const filtros = [
  { label: "Todas", value: "todas" },
  { label: "IA Atendimento", value: "ia_atendimento" },
  { label: "IA Funções", value: "ia_funcoes" },
  { label: "Humano", value: "humano" },
] as const;

export default function ConversasPage() {
  const {
    conversas,
    conversaAtiva,
    mensagens,
    loading,
    setConversaAtiva,
    enviarMensagem,
    updateConversaStatus,
    carregarConversas,
  } = useChatStore();

  const [filtroAtivo, setFiltroAtivo] = useState<string>("todas");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    carregarConversas(EMPRESA_ID);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const handleSend = async (texto: string) => {
    if (!conversaAtiva) return;
    const enviadoPor = conversaAtiva.status.startsWith("ia") ? "ia" : "humano";
    await enviarMensagem(conversaAtiva.id, texto, enviadoPor);
    if (conversaAtiva.status.startsWith("ia") && texto.toLowerCase().includes("transferir")) {
      updateConversaStatus(conversaAtiva.id, "humano");
    }
  };

  const handleToggleStatus = () => {
    if (!conversaAtiva) return;
    const novoStatus =
      conversaAtiva.status === "ia_atendimento" ? "humano"
      : conversaAtiva.status === "humano" ? "ia_atendimento"
      : "ia_atendimento";
    updateConversaStatus(conversaAtiva.id, novoStatus);
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.from("conversas").update({ status: novoStatus }).eq("id", conversaAtiva.id);
    });
  };

  const conversasFiltradas =
    filtroAtivo === "todas"
      ? conversas
      : conversas.filter((c) => c.status === filtroAtivo);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const modoIA = conversaAtiva?.status.startsWith("ia") ?? false;

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      <div className="w-80 border-r border-border flex flex-col shrink-0 overflow-hidden">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Conversas
            </h2>
            <span className="text-xs text-text-muted bg-surface px-2 py-1 rounded-full">
              {conversas.length}
            </span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {filtros.map((f) => (
              <button
                key={f.value}
                onClick={() => setFiltroAtivo(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  filtroAtivo === f.value
                    ? "bg-primary/20 text-primary"
                    : "bg-surface text-text-muted hover:bg-surface-hover"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversasFiltradas.map((c) => (
              <ConversaCard
                key={c.id}
                conversa={c}
                ativa={conversaAtiva?.id === c.id}
                onClick={() => setConversaAtiva(c)}
              />
            ))
          )}
        </div>
      </div>

      {conversaAtiva ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium truncate">{conversaAtiva.cliente_nome}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className={conversaAtiva.status === "ia_atendimento" ? "text-ia" : conversaAtiva.status === "ia_funcoes" ? "text-yellow-500" : "text-humano"}>
                    {conversaAtiva.status === "ia_atendimento" ? "🤖 IA respondendo" : conversaAtiva.status === "ia_funcoes" ? "🔧 IA executando funções" : "👤 Atendimento humano"}
                  </span>
                  {conversaAtiva.resumo_motivo && (
                    <>
                      <span className="text-text-muted">•</span>
                      <span className="text-text-muted truncate">{conversaAtiva.resumo_motivo}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleStatus}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ml-2 ${
                modoIA ? "bg-humano/20 text-humano hover:bg-humano/30" : "bg-ia/20 text-ia hover:bg-ia/30"
              }`}
            >
              {modoIA ? "Assumir atendimento" : "Voltar para IA"}
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {mensagens.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma mensagem nesta conversa</p>
                <p className="text-xs mt-1">Envie uma mensagem para iniciar o atendimento</p>
              </div>
            ) : (
              mensagens.map((m) => <ChatMessage key={m.id} mensagem={m} />)
            )}
          </div>
          <ChatInput onSend={handleSend} modoIA={modoIA} onToggleModo={handleToggleStatus} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Selecione uma conversa</p>
            <p className="text-sm mt-1">Escolha uma conversa à esquerda para começar</p>
          </div>
        </div>
      )}
    </div>
  );
}
