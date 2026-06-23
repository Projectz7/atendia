import asyncio
import logging

logger = logging.getLogger("AtendIA.Transbordo")

MENSAGEM_TRANSBORDO = (
    "Aguarde um momento, nossa equipe ja vai te atender. "
    "Em breve um de nossos atendentes entrara em contato."
)


async def executar_transbordo_humano(
    empresa_id: str,
    conversa_id: str,
    whatsapp_numero: str,
    supabase,
    disparar_whatsapp,
    registrar_mensagem,
):
    """
    Transfere o atendimento para um humano:
    1. Envia mensagem generica
    2. Atualiza status da conversa para 'humano'
    3. Dispara notificacao FCM para os APKs dos vendedores
    """
    logger.info(f"Transbordando conversa {conversa_id} para humano")

    # 1. Envia mensagem padrao
    await disparar_whatsapp(whatsapp_numero, MENSAGEM_TRANSBORDO)
    await registrar_mensagem(conversa_id, empresa_id, MENSAGEM_TRANSBORDO, "ia")

    # 2. Atualiza status no banco
    supabase.table("conversas").update({
        "status": "humano",
        "resumo_motivo": "Triagem finalizada - Pronto para atendimento humano",
    }).eq("id", conversa_id).execute()

    # 3. Dispara notificacao FCM
    payload_fcm = {
        "to": f"/topics/empresa_{empresa_id}",
        "priority": "high",
        "notification": {
            "title": "ATENDIMENTO PENDENTE",
            "body": f"Cliente {whatsapp_numero} aguarda interacao humana.",
            "sound": "default",
            "android_channel_id": "canal_atendimento_critico",
        },
        "data": {
            "conversa_id": conversa_id,
            "click_action": "ATENDIMENTO_PENDENTE",
        },
    }
    logger.info(f"FCM disparado para empresa {empresa_id}: {payload_fcm}")
