import asyncio
import logging
from db import supabase
from config import QUEUE_MAX_SIZE

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("AtendIA.WaHa")

fila_atendia: asyncio.Queue = asyncio.Queue(maxsize=QUEUE_MAX_SIZE)


async def post_webhook_whatsapp_entrada(payload: dict) -> dict:
    """
    Produtor da fila. Recebe mensagem do WhatsApp webhook,
    salva no banco e insere na fila de processamento.
    """
    empresa_id = payload.get("empresa_id")
    whatsapp_numero = payload.get("from")
    tipo_midia = payload.get("type", "texto")
    conteudo = payload.get("body", "")

    # Busca ou cria conversa
    conversa = (
        supabase.table("conversas")
        .select("*")
        .eq("empresa_id", empresa_id)
        .eq("whatsapp_numero", whatsapp_numero)
        .execute()
    )

    if not conversa.data:
        result = (
            supabase.table("conversas")
            .insert({
                "empresa_id": empresa_id,
                "whatsapp_numero": whatsapp_numero,
                "status": "ia_atendimento",
                "tipo_contato": "novo_lead",
            })
            .execute()
        )
        conversa_id = result.data[0]["id"]
        cliente_nome = None
    else:
        conversa_id = conversa.data[0]["id"]
        cliente_nome = conversa.data[0].get("cliente_nome")

    # Salva mensagem no banco (ativa Realtime para o painel)
    msg_result = (
        supabase.table("mensagens")
        .insert({
            "conversa_id": conversa_id,
            "empresa_id": empresa_id,
            "direcao": "entrada",
            "tipo": tipo_midia,
            "conteudo": conteudo,
            "enviado_por": "cliente",
        })
        .execute()
    )
    mensagem_id = msg_result.data[0]["id"]

    # Insere na fila
    await fila_atendia.put({
        "mensagem_id": mensagem_id,
        "conversa_id": conversa_id,
        "empresa_id": empresa_id,
        "whatsapp_numero": whatsapp_numero,
        "cliente_nome": cliente_nome,
        "tipo": tipo_midia,
        "conteudo": conteudo,
    })

    logger.info(f"Mensagem {mensagem_id} enfileirada para conversa {conversa_id}")
    return {"status": "queued", "conversa_id": conversa_id}
