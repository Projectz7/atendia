import asyncio
import logging

logger = logging.getLogger("AtendIA.Whisper")


async def executar_whisper_local(url_audio: str, mensagem_id: str, supabase) -> str:
    """
    Transcreve audio usando Whisper local (modelo tiny).
    Salva o texto transcrito na tabela mensagens.
    """
    logger.info(f"Transcrevendo audio: {url_audio}")

    try:
        import subprocess
        import tempfile
        import os

        with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
            tmp_path = tmp.name

        subprocess.run(["curl", "-s", "-o", tmp_path, url_audio], check=True, capture_output=True)

        result = subprocess.run(
            ["whisper", tmp_path, "--model", "tiny", "--language", "pt", "--output_format", "txt"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        texto = result.stdout.strip()

        os.unlink(tmp_path)

        if not texto:
            texto = "[Transcricao nao disponivel]"

    except Exception as e:
        logger.warning(f"Falha na transcricao de audio: {e}")
        texto = "[Audio recebido - falha na transcricao]"

    supabase.table("mensagens").update({"texto_transcrito": texto}).eq("id", mensagem_id).execute()
    return texto
