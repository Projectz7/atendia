import { Sidebar } from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export function Layout() {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main
        ref={mainRef}
        className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-glow"
      >
        <div className="animate-fade-in flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
