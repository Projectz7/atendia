import asyncio
import random
import logging

logger = logging.getLogger("AtendIA.Campanhas")


async def rotina_loop_disparo_campanhas(supabase, disparar_whatsapp):
    """
    Worker de disparo de campanhas com delay anti-spam.
    Processa um disparo por vez com delay aleatorio entre 45-75 segundos.
    """
    logger.info("Worker de campanhas iniciado")

    while True:
        # Busca proximo disparo pendente
        disparo = (
            supabase.table("campanhas_disparos")
            .select("*")
            .eq("status", "pendente")
            .order("created_at")
            .limit(1)
            .execute()
        )

        if not disparo.data:
            await asyncio.sleep(10)
            continue

        item = disparo.data[0]

        # Marca como processando (evita concorrencia)
        supabase.table("campanhas_disparos").update({"status": "processando"}).eq("id", item["id"]).execute()

        try:
            logger.info(f"Disparando campanha para {item['whatsapp_numero']}")
            await disparar_whatsapp(item["whatsapp_numero"], item["mensagem_base"])

            supabase.table("campanhas_disparos").update({
                "status": "enviado",
                "enviado_em": "now()",
            }).eq("id", item["id"]).execute()

        except Exception as e:
            logger.error(f"Falha no disparo {item['id']}: {e}")
            supabase.table("campanhas_disparos").update({"status": "falhou"}).eq("id", item["id"]).execute()

        # Delay anti-spam (simula comportamento humano)
        delay = random.randint(45, 75)
        logger.info(f"Aguardando {delay}s antes do proximo disparo")
        await asyncio.sleep(delay)
