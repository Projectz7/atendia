import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useChatStore } from "@/stores/chatStore";

export function useRealtimeChat(empresaId: string | undefined) {
  const { addMensagem, updateConversaStatus, setConversas, setMensagens } = useChatStore();

  useEffect(() => {
    if (!empresaId) return;

    supabase
      .channel("conversas")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversas", filter: `empresa_id=eq.${empresaId}` },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data } = await supabase.from("conversas").select("*").eq("id", payload.new.id).single();
            if (data) {
              useChatStore.getState().setConversas([data, ...useChatStore.getState().conversas]);
            }
          }
          if (payload.eventType === "UPDATE") {
            updateConversaStatus(payload.new.id, payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeAllChannels();
    };
  }, [empresaId]);

  useEffect(() => {
    const conversaAtiva = useChatStore.getState().conversaAtiva;
    if (!conversaAtiva) return;

    const channel = supabase
      .channel("mensagens")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensagens", filter: `conversa_id=eq.${conversaAtiva.id}` },
        (payload) => addMensagem(payload.new as any)
      )
      .subscribe();

    supabase
      .from("mensagens")
      .select("*")
      .eq("conversa_id", conversaAtiva.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMensagens(data);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [useChatStore.getState().conversaAtiva?.id]);
}
