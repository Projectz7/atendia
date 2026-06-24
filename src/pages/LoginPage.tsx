import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Bot, Loader2, AlertCircle, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (!email.trim() || !password.trim()) {
      setErro("Preencha email e senha");
      return;
    }
    if (password.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setSubmitting(true);
    const fn = modo === "login" ? signIn : signUp;
    const error = await fn(email, password);
    setSubmitting(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setErro("Email ou senha inválidos");
      } else if (error.message.includes("Email not confirmed")) {
        setErro("Confirme seu email antes de fazer login");
      } else if (error.message.includes("already registered")) {
        setErro("Este email já está cadastrado");
      } else {
        setErro(error.message);
      }
      return;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">AtendIA</h1>
          <p className="text-sm text-text-muted mt-1">Painel de Atendimento Inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">
            {modo === "login" ? "Entrar" : "Criar Conta"}
          </h2>

          {erro && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 text-danger text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-text-muted block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {submitting
              ? "Aguarde..."
              : modo === "login"
              ? "Entrar"
              : "Criar Conta"}
          </button>

          <p className="text-center text-sm text-text-muted">
            {modo === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => { setModo(modo === "login" ? "cadastro" : "login"); setErro(""); }}
              className="text-primary hover:underline font-medium"
            >
              {modo === "login" ? "Cadastre-se" : "Fazer login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
