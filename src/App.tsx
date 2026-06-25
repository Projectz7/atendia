import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuthStore } from "@/stores/authStore";
import { ToastContainer } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loader2 } from "lucide-react";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ConversasPage = lazy(() => import("@/pages/ConversasPage"));
const CampanhasPage = lazy(() => import("@/pages/CampanhasPage"));
const TarefasPage = lazy(() => import("@/pages/TarefasPage"));
const ConfigIAPage = lazy(() => import("@/pages/ConfigIAPage"));
const ConfigWhatsAppPage = lazy(() => import("@/pages/ConfigWhatsAppPage"));
const ConfigMCPPage = lazy(() => import("@/pages/ConfigMCPPage"));

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => { initialize(); }, [initialize]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Suspense fallback={<Loading />}><ErrorBoundary><LoginPage /></ErrorBoundary></Suspense>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<Loading />}><ErrorBoundary><ConversasPage /></ErrorBoundary></Suspense>} />
          <Route path="/campanhas" element={<Suspense fallback={<Loading />}><ErrorBoundary><CampanhasPage /></ErrorBoundary></Suspense>} />
          <Route path="/tarefas" element={<Suspense fallback={<Loading />}><ErrorBoundary><TarefasPage /></ErrorBoundary></Suspense>} />
          <Route path="/config-ia-atendimento" element={<Suspense fallback={<Loading />}><ErrorBoundary><ConfigIAPage /></ErrorBoundary></Suspense>} />
          <Route path="/config-ia-funcoes" element={<Suspense fallback={<Loading />}><ErrorBoundary><ConfigIAPage /></ErrorBoundary></Suspense>} />
          <Route path="/config-whatsapp" element={<Suspense fallback={<Loading />}><ErrorBoundary><ConfigWhatsAppPage /></ErrorBoundary></Suspense>} />
          <Route path="/config-mcp" element={<Suspense fallback={<Loading />}><ErrorBoundary><ConfigMCPPage /></ErrorBoundary></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
