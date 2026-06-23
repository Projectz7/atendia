import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { Wrench, Database, Check, X, Search } from "lucide-react";

const EMPRESA_ID = import.meta.env.VITE_EMPRESA_ID || "default";

const categoriaIcon = {
  consulta: Database,
  acao: Wrench,
};

const categoriaCor = {
  consulta: "#22c55e",
  acao: "#3b82f6",
};

export default function ConfigMCPPage() {
  const { mcpFerramentas, toggleMCP, carregarMCP } = useAppStore();

  useEffect(() => { carregarMCP(EMPRESA_ID); }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          Ferramentas MCP
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Ferramentas que as IAs podem executar no banco de dados. Ative ou desative conforme necessário para economizar tokens.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar ferramenta..."
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-1">
          <span className="text-xs text-text-muted bg-surface px-2 py-1.5 rounded-lg">
            {mcpFerramentas.filter((m) => m.ativa).length}/{mcpFerramentas.length} ativas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {mcpFerramentas.map((ferramenta) => {
          const Icon = categoriaIcon[ferramenta.categoria] ?? Wrench;
          const cor = categoriaCor[ferramenta.categoria] ?? "#94a3b8";

          return (
            <div
              key={ferramenta.id}
              className={`bg-surface rounded-xl border p-4 transition-all ${
                ferramenta.ativa ? "border-primary/20" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: cor + "20" }}
                >
                  <Icon className="w-4 h-4" style={{ color: cor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{ferramenta.nome}</h4>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: cor + "20", color: cor }}
                    >
                      {ferramenta.categoria === "consulta" ? "Consulta" : "Ação"}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{ferramenta.descricao}</p>
                </div>
                <button
                  onClick={() => toggleMCP(ferramenta.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    ferramenta.ativa
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      : "bg-text-muted/20 text-text-muted hover:bg-text-muted/30"
                  }`}
                >
                  {ferramenta.ativa ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
