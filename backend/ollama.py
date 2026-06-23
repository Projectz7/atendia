import asyncio
import httpx
import logging
import json

logger = logging.getLogger("AtendIA.Ollama")


async def chamar_ollama_api(
    system_prompt: str,
    historico: list,
    nova_mensagem: str,
    modelo: str = "llama3.2",
    endpoint: str = "http://localhost:11434",
) -> str:
    """
    Chama a API do Ollama local com contexto completo:
    - system_prompt (definido pelo usuario)
    - historico das ultimas mensagens
    - nova mensagem do cliente
    """
    messages = [{"role": "system", "content": system_prompt}]

    # Adiciona historico (max 10 mensagens)
    for msg in historico[:10]:
        role = "user" if msg.get("direcao") == "entrada" else "assistant"
        content = msg.get("texto_transcrito") or msg.get("conteudo", "")
        if content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": nova_mensagem})

    payload = {
        "model": modelo,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 512,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(f"{endpoint}/api/chat", json=payload)
            data = resp.json()
            return data.get("message", {}).get("content", "")

    except Exception as e:
        logger.error(f"Erro ao chamar Ollama: {e}")
        return "Desculpe, estou com dificuldades tecnicas no momento. Um atendente humano sera chamado."
