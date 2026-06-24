import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  MessageSquare,
  Send,
  Calendar,
  Sparkles,
  Wrench,
  MessageCircle,
  Bot,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

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
  const { user, signOut } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-primary/15 to-transparent text-primary font-medium border-l-2 border-primary"
        : "text-text-muted hover:bg-surface-hover hover:text-text border-l-2 border-transparent"
    }`;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-surface/80 backdrop-blur-sm border-r border-border flex flex-col h-full shrink-0 transition-all duration-300`}
    >
      <div className="p-5 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-text truncate">AtendIA</h1>
              <p className="text-[10px] text-text-muted truncate">Painel de Atendimento</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-hover transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-3 pt-2 pb-1">
            Atendimento
          </p>
        )}
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={linkClass}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium px-3 pt-4 pb-1">
            Configurações
          </p>
        )}
        {configLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={linkClass}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="p-3 border-t border-border">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/50 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            {collapsed && (
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
