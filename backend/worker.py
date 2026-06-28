import asyncio
import logging
from db import supabase
from webhook import fila_atendia
from whisper import executar_whisper_local
from vision import executar_llama_vision_local
from triagem import executar_triagem_cognitiva
from transbordo import executar_transbordo_humano
from ollama import chamar_ollama_api
from config import settings

logger = logging.getLogger("AtendIA.Worker")


async def disparar_resposta_whatsapp(numero: str, texto: str):
    """
    Envia mensagem via API do WhatsApp (WaHa).
    Mock: apenas log. Substituir pela integracao real.
    """
    logger.info(f"[WHATSAPP] Envio para {numero}: {texto[:60]}...")
    await asyncio.sleep(0.1)


async def registrar_mensagem_banco(conversa_id: str, empresa_id: str, texto: str, enviado_por: str = "ia"):
    supabase.table("mensagens").insert({
        "conversa_id": conversa_id,
        "empresa_id": empresa_id,
        "direcao": "saida",
        "tipo": "texto",
        "conteudo": texto,
        "enviado_por": enviado_por,
    }).execute()


async def worker_processador_ia_local():
    """
    Consumidor da fila. Processa uma mensagem por vez.
    """
    logger.info("Worker de IA Local iniciado")

    while True:
        tarefa = await fila_atendia.get()
        conversa_id = tarefa["conversa_id"]
        empresa_id = tarefa["empresa_id"]
        whatsapp_numero = tarefa["whatsapp_numero"]

        try:
            # 1. CHECAGEM DE TAKEOVER HUMANO
            conversa_atual = (
                supabase.table("conversas")
                .select("status, tipo_contato")
                .eq("id", conversa_id)
                .execute()
            )
            if not conversa_atual.data or conversa_atual.data[0]["status"] == "humano":
                logger.info(f"Conversa {conversa_id} em modo humano. Ignorando IA.")
                fila_atendia.task_done()
                continue

            status_fluxo = conversa_atual.data[0]["status"]
            tipo_contato = conversa_atual.data[0].get("tipo_contato", "novo_lead")

            # 2. TRATAMENTO DE MIDIAS
            texto_final = tarefa["conteudo"]

            if tarefa["tipo"] == "audio":
                texto_final = await executar_whisper_local(
                    tarefa["conteudo"], tarefa["mensagem_id"], supabase
                )
            elif tarefa["tipo"] == "imagem":
                descricao = await executar_llama_vision_local(tarefa["conteudo"], status_fluxo)
                if descricao:
                    texto_final = descricao
                else:
                    await disparar_resposta_whatsapp(
                        whatsapp_numero,
                        "Recebi sua imagem! Pode me detalhar brevemente do que se trata?",
                    )
                    await registrar_mensagem_banco(conversa_id, empresa_id, "Recebi sua imagem! Pode me detalhar brevemente do que se trata?")
                    fila_atendia.task_done()
                    continue

            # 3. TRIAGEM COGNITIVA (apenas para novos leads)
            if tipo_contato == "novo_lead":
                tipo_contato = await executar_triagem_cognitiva(
                    empresa_id, conversa_id, texto_final, supabase
                )

            # Se for fornecedor, transborda imediatamente
            if tipo_contato == "fornecedor_credor":
                await executar_transbordo_humano(
                    empresa_id, conversa_id, whatsapp_numero,
                    supabase, disparar_resposta_whatsapp, registrar_mensagem_banco,
                )
                fila_atendia.task_done()
                continue

            # 4. ISOLAMENTO DE CONTEXTO + CHAMADA IA
            historico = (
                supabase.table("mensagens")
                .select("direcao, conteudo, texto_transcrito")
                .eq("conversa_id", conversa_id)
                .order("criado_em", desc=True)
                .limit(10)
                .execute()
            )
            config_ia = (
                supabase.table("ia_configuracoes")
                .select("modelo, endpoint, system_prompt, provedor")
                .eq("empresa_id", empresa_id)
                .eq("tipo", "atendimento")
                .eq("ativo", True)
                .limit(1)
                .execute()
            )

            if config_ia.data:
                cfg = config_ia.data[0]
                system_prompt = cfg["system_prompt"]
                modelo = cfg["modelo"]
                endpoint = cfg["endpoint"]
            else:
                system_prompt = "Voce e um assistente comercial amigavel."
                modelo = LLM_MODEL
                endpoint = OLLAMA_ENDPOINT

            # 5. CHAMAR IA
            resposta_ia = await chamar_ollama_api(
                system_prompt=system_prompt,
                historico=historico.data or [],
                nova_mensagem=texto_final,
                modelo=modelo,
                endpoint=endpoint,
            )

            # 6. VERIFICAR SE IA PEDIU TRANSBORDO
            if "[TRANSBORDO_PRONTO]" in resposta_ia:
                resposta_limpa = resposta_ia.replace("[TRANSBORDO_PRONTO]", "").strip()
                await disparar_resposta_whatsapp(whatsapp_numero, resposta_limpa)
                await registrar_mensagem_banco(conversa_id, empresa_id, resposta_limpa)
                await executar_transbordo_humano(
                    empresa_id, conversa_id, whatsapp_numero,
                    supabase, disparar_resposta_whatsapp, registrar_mensagem_banco,
                )
            else:
                await disparar_resposta_whatsapp(whatsapp_numero, resposta_ia)
                await registrar_mensagem_banco(conversa_id, empresa_id, resposta_ia)

            # 7. ATUALIZACAO DO CONTATO
            if not tarefa.get("cliente_nome") and "me chamo" in texto_final.lower():
                import re
                match = re.search(r"me chamo\s+(\w+)", texto_final.lower())
                if match:
                    supabase.table("conversas").update({
                        "cliente_nome": match.group(1).capitalize(),
                    }).eq("id", conversa_id).execute()

        except Exception as e:
            logger.error(f"Erro critico na conversa {conversa_id}: {e}")
        finally:
            fila_atendia.task_done()
