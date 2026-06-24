import { Bot, MessageSquare, Send, Calendar, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: MessageCircle,
    title: "Conecte o WhatsApp",
    desc: "Configure o webhook WaHa na página de configurações",
    link: "/config-whatsapp",
    color: "#22c55e",
  },
  {
    icon: Sparkles,
    title: "Configure as IAs",
    desc: "Defina o comportamento da IA de atendimento e funções",
    link: "/config-ia-atendimento",
    color: "#a855f7",
  },
  {
    icon: Send,
    title: "Crie campanhas",
    desc: "Dispare mensagens em lote com delay anti-spam",
    link: "/campanhas",
    color: "#3b82f6",
  },
  {
    icon: Calendar,
    title: "Agende tarefas",
    desc: "Programe lembretes automáticos com execução via IA",
    link: "/tarefas",
    color: "#f59e0b",
  },
];

import { MessageCircle } from "lucide-react";

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-lg w-full text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-6 shadow-lg shadow-primary/20">
          <Bot className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo ao <span className="text-primary">AtendIA</span>
        </h1>
        <p className="text-text-muted text-sm mb-8 max-w-md mx-auto">
          Seu painel inteligente de atendimento WhatsApp. Conecte, configure e automatize
          o atendimento ao cliente com IA.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.link}
                onClick={() => navigate(step.link)}
                className="bg-surface rounded-xl border border-border p-4 card-hover text-left group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: step.color + "20" }}
                >
                  <Icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-text-muted">{step.desc}</p>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-text-muted">
          Quando surgirem conversas, elas aparecerão automaticamente aqui
        </p>
      </div>
    </div>
  );
}
