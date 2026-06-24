import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { useToastStore } from "@/stores/toastStore";
import { Wrench, Database, Check, X, Search, Loader2 } from "lucide-react";

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
  const { mcpFerramentas, toggleMCP, carregarMCP, loadingMCP } = useAppStore();
  const { addToast } = useToastStore();
  const [search, setSearch] = useState("");

  useEffect(() => { carregarMCP(EMPRESA_ID); }, []);

  const handleToggle = async (id: string) => {
    try {
      await toggleMCP(id);
      const f = mcpFerramentas.find((m) => m.id === id);
      addToast("success", `Ferramenta "${f?.nome}" ${f?.ativa ? "desativada" : "ativada"}`);
    } catch {
      addToast("error", "Erro ao alternar ferramenta");
    }
  };

  const filtradas = mcpFerramentas.filter(
    (m) => m.nome.toLowerCase().includes(search.toLowerCase()) || m.descricao.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingMCP) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="h-7 w-56 bg-surface rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface-hover animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-5 w-32 bg-surface-hover rounded animate-pulse mb-1" />
                  <div className="h-4 w-48 bg-surface-hover rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        {filtradas.length === 0 ? (
          <div className="col-span-full text-center py-12 text-text-muted">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ferramenta encontrada</p>
          </div>
        ) : (
          filtradas.map((ferramenta) => {
            const Icon = categoriaIcon[ferramenta.categoria] ?? Wrench;
            const cor = categoriaCor[ferramenta.categoria] ?? "#94a3b8";

            return (
              <div
                key={ferramenta.id}
                className={`bg-surface rounded-xl border p-4 transition-all hover:border-primary/20 ${
                  ferramenta.ativa ? "border-primary/20" : "border-border opacity-60 hover:opacity-80"
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
                    onClick={() => handleToggle(ferramenta.id)}
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
          })
        )}
      </div>
    </div>
  );
}
