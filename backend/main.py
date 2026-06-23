import asyncio
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("AtendIA")


async def main():
    logger.info("=" * 50)
    logger.info("  AtendIA - WaHa Orchestrator v0.1.0")
    logger.info("  Painel de Atendimento Multiusuario via WhatsApp com IA")
    logger.info("=" * 50)

    from worker import worker_processador_ia_local
    from campanhas import rotina_loop_disparo_campanhas
    from db import supabase

    async def disparar_whatsapp(numero: str, texto: str):
        import httpx
        logger.info(f"[WHATSAPP] Enviando para {numero}: {texto[:60]}...")
        await asyncio.sleep(0.1)

    await asyncio.gather(
        worker_processador_ia_local(),
        rotina_loop_disparo_campanhas(supabase, disparar_whatsapp),
    )


if __name__ == "__main__":
    asyncio.run(main())
