import { useToastStore, type ToastType } from "@/stores/toastStore";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

const config: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string }> = {
  success: { icon: CheckCircle, bg: "bg-green-500/10", border: "border-green-500/30" },
  error: { icon: XCircle, bg: "bg-red-500/10", border: "border-red-500/30" },
  info: { icon: Info, bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const { icon: Icon, bg, border } = config[toast.type];
        return (
          <div
            key={toast.id}
            className={`${bg} ${border} border rounded-xl px-4 py-3 flex items-start gap-3 shadow-lg backdrop-blur-sm animate-slide-up`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
