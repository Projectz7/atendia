import asyncio
import logging

logger = logging.getLogger("AtendIA.Vision")


async def executar_llama_vision_local(url_imagem: str, contexto: str) -> str:
    """
    Processa imagem usando Llama 3.2 Vision via Ollama.
    Retorna a descricao interpretada da imagem.
    """
    logger.info(f"Processando imagem: {url_imagem}")

    try:
        import httpx

        payload = {
            "model": "llama3.2-vision",
            "messages": [
                {
                    "role": "user",
                    "content": f"""
Descreva detalhadamente o que esta imagem mostra, no contexto de: {contexto}
Se for uma imagem de obra, servico, ou material, descreva o estado, dimensoes aparentes e condicoes.
Se nao for possivel identificar, responda: "[NAO_IDENTIFICADO]"
""",
                    "images": [url_imagem],
                }
            ],
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post("http://localhost:11434/api/chat", json=payload)
            data = resp.json()

        descricao = data.get("message", {}).get("content", "[NAO_IDENTIFICADO]")

        if "[NAO_IDENTIFICADO]" in descricao:
            return ""

        return f"[Visao da IA]: {descricao}"

    except Exception as e:
        logger.warning(f"Falha no processamento de imagem: {e}")
        return ""
