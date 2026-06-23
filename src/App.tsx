import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";

const ConversasPage = lazy(() => import("@/pages/ConversasPage"));
const CampanhasPage = lazy(() => import("@/pages/CampanhasPage"));
const TarefasPage = lazy(() => import("@/pages/TarefasPage"));
const ConfigIAPage = lazy(() => import("@/pages/ConfigIAPage"));
const ConfigWhatsAppPage = lazy(() => import("@/pages/ConfigWhatsAppPage"));
const ConfigMCPPage = lazy(() => import("@/pages/ConfigMCPPage"));

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Suspense fallback={<Loading />}><ConversasPage /></Suspense>} />
          <Route path="/campanhas" element={<Suspense fallback={<Loading />}><CampanhasPage /></Suspense>} />
          <Route path="/tarefas" element={<Suspense fallback={<Loading />}><TarefasPage /></Suspense>} />
          <Route path="/config-ia-atendimento" element={<Suspense fallback={<Loading />}><ConfigIAPage /></Suspense>} />
          <Route path="/config-ia-funcoes" element={<Suspense fallback={<Loading />}><ConfigIAPage /></Suspense>} />
          <Route path="/config-whatsapp" element={<Suspense fallback={<Loading />}><ConfigWhatsAppPage /></Suspense>} />
          <Route path="/config-mcp" element={<Suspense fallback={<Loading />}><ConfigMCPPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
