import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Calendar,
  Sparkles,
  Wrench,
  MessageCircle,
  Bot,
} from "lucide-react";

const links = [
  { to: "/", icon: MessageSquare, label: "Conversas" },
  { to: "/campanhas", icon: Send, label: "Campanhas" },
  { to: "/tarefas", icon: Calendar, label: "Tarefas" },
];

const configLinks = [
  { to: "/config-ia-atendimento", icon: Sparkles, label: "IA Atendimento" },
  { to: "/config-ia-funcoes", icon: Wrench, label: "IA Funções" },
  { to: "/config-whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { to: "/config-mcp", icon: Bot, label: "Ferramentas MCP" },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Bot className="w-6 h-6" />
          AtendIA
        </h1>
        <p className="text-xs text-text-muted mt-1">Painel de Atendimento</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-3 pt-2 pb-1">
          Atendimento
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-muted hover:bg-surface-hover hover:text-text"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-3 pt-4 pb-1">
          Configurações
        </p>
        {configLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-muted hover:bg-surface-hover hover:text-text"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
