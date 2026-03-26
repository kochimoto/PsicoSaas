/**
 * Evolution API v2 — Biblioteca de integração WhatsApp
 * Documentação: https://doc.evolution-api.com
 */

const BASE_URL = process.env.WHATS_API_URL || "http://evolution:8080";
const API_KEY = process.env.WHATS_API_KEY || "123456";

const headers = {
  "Content-Type": "application/json",
  "apikey": API_KEY,
};

// ─── Instâncias ────────────────────────────────────────────────

/** Cria uma nova instância WhatsApp */
export async function createInstance(instanceName: string) {
  const res = await fetch(`${BASE_URL}/instance/create`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
    }),
  });

  const data = await res.json();

  // 409 = já existe (ok), qualquer outro erro lança exceção
  if (!res.ok && res.status !== 409) {
    console.error("[WA] createInstance error:", res.status, data);
    throw new Error(`Erro ao criar instância (${res.status})`);
  }

  return data;
}

/** Busca o QR Code base64 para conexão (com retry interno para timing do Baileys) */
export async function getQrCode(instanceName: string): Promise<string | null> {
  const MAX_RETRIES = 4;
  const RETRY_DELAY_MS = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/instance/connect/${instanceName}`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      if (!res.ok) {
        console.warn(`[WA] getQrCode attempt ${attempt}/${MAX_RETRIES} non-ok:`, res.status);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        return null;
      }

      const data = await res.json();
      console.log(`[WA] getQrCode attempt ${attempt}/${MAX_RETRIES} raw:`, JSON.stringify(data).substring(0, 300));

      // O QR pode vir em campos diferentes dependendo da versão
      const raw = data?.base64 || data?.qrcode?.base64 || data?.code || data?.qrCode;

      if (raw) {
        // Remove prefixo data:image se vier junto
        return String(raw).replace(/^data:image\/[a-z]+;base64,/, "");
      }

      // QR still not ready (e.g. {"count":0}) — retry
      console.log(`[WA] QR not ready yet, retrying in ${RETRY_DELAY_MS}ms...`);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    } catch (err) {
      console.error(`[WA] getQrCode attempt ${attempt} error:`, err);
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }

  return null;
}

/** Retorna o estado da instância */
export async function getConnectionState(instanceName: string) {
  const res = await fetch(`${BASE_URL}/instance/connectionState/${instanceName}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    return { state: "close" as const };
  }

  const data = await res.json();
  const raw = data?.instance?.state || data?.state || "close";
  return { state: raw as string };
}

/** Deleta uma instância */
export async function deleteInstance(instanceName: string) {
  const res = await fetch(`${BASE_URL}/instance/delete/${instanceName}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  return res.ok;
}

// ─── Mensagens ─────────────────────────────────────────────────

/** Envia mensagem de texto */
export async function sendTextMessage(
  instanceName: string,
  number: string,
  text: string
) {
  const res = await fetch(`${BASE_URL}/message/sendText/${instanceName}`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      number,
      text,
      delay: 1200,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[WA] sendTextMessage error:", res.status, err);
    throw new Error(`Erro ao enviar mensagem (${res.status})`);
  }

  return res.json();
}
