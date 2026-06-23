import logging

logger = logging.getLogger("AtendIA.Triagem")

GATILHOS_FORNECEDOR = [
    "boleto", "nota fiscal", "nf", "nf-e", "distribuidora",
    "catalogo", "fornecimento", "vender perfis", "vender materia",
    "vender material", "nota de ", "nf de ", "nf-e de ",
]


async def executar_triagem_cognitiva(empresa_id: str, conversa_id: str, texto: str, supabase) -> str:
    """
    Avalia o teor do texto para classificar a natureza do contato.
    Retorna o tipo_contato identificado.
    """
    texto_min = texto.lower().strip()

    # Check 1: Fornecedor/Credor
    if any(g in texto_min for g in GATILHOS_FORNECEDOR):
        supabase.table("conversas").update({"tipo_contato": "fornecedor_credor"}).eq("id", conversa_id).execute()
        logger.info(f"Conversa {conversa_id} classificada como FORNECEDOR_CREDOR")
        return "fornecedor_credor"

    # Check 2: Cliente ativo (ja tem OS no banco)
    vinculo = (
        supabase.table("pedidos")
        .select("id")
        .eq("empresa_id", empresa_id)
        .eq("cliente_telefone", texto_min)
        .limit(1)
        .execute()
    )
    if vinculo.data:
        supabase.table("conversas").update({"tipo_contato": "cliente_ativo"}).eq("id", conversa_id).execute()
        logger.info(f"Conversa {conversa_id} classificada como CLIENTE_ATIVO")
        return "cliente_ativo"

    return "novo_lead"
