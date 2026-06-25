import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  modoIA: boolean;
  onToggleModo: () => void;
}

export function ChatInput({ onSend, modoIA, onToggleModo }: Props) {
  const [texto, setTexto] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    onSend(texto.trim());
    setTexto("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleModo}
          className={`p-2 rounded-lg transition-colors`}
          style={{
            background: modoIA
              ? "color-mix(in srgb, var(--color-ia) 20%, transparent)"
              : "color-mix(in srgb, var(--color-humano) 20%, transparent)",
            color: modoIA ? "var(--color-ia)" : "var(--color-humano)",
          }}
          title={modoIA ? "Respondendo como IA" : "Respondendo como Humano"}
        >
          {modoIA ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </button>

        <input
          ref={inputRef}
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />

        <button
          type="submit"
          disabled={!texto.trim()}
          className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
