/**
 * Evolution API v2 — Biblioteca de integração WhatsApp (RESTORED STABLE VERSION)
 */

const WHATS_API_URL = process.env.WHATS_API_URL || "http://evolution:8080";
const WHATS_API_KEY = process.env.WHATS_API_KEY || "123456";

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  const url = `${WHATS_API_URL.replace(/\/$/, "")}${endpoint}`;
  
  // LOG para monitorar em produção (docker compose logs -f psicosaas)
  console.log(`[WA] Request: ${method} ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATS_API_KEY
    },
    cache: "no-store"
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[WA] Error Response:", response.status, errorData);
      throw new Error(`[Status: ${response.status}] ${errorData?.message?.message || errorData?.message || response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("[WA] Network Error:", error.message);
    throw new Error(`Falha de conexão com a Evolution API: ${error.message} (URL: ${url})`);
  }
}

// ─── Instâncias ────────────────────────────────────────────────

export async function createInstance(instanceName: string) {
  return whatsApiRequest("/instance/create", "POST", {
    instanceName,
    integration: "WHATSAPP-BAILEYS",
    qrcode: true,
  });
}

export async function getQrCode(instanceName: string): Promise<string | null> {
  try {
    const data = await whatsApiRequest(`/instance/connect/${instanceName}`, "GET");
    const raw = data?.base64 || data?.qrcode?.base64 || data?.code || data?.qrCode;

    if (raw) {
      return String(raw).replace(/^data:image\/[a-z]+;base64,/, "");
    }
  } catch (err) {
    console.error(`[WA] getQrCode error:`, err);
  }
  return null;
}

export async function getConnectionState(instanceName: string) {
  try {
    const data = await whatsApiRequest(`/instance/connectionState/${instanceName}`, "GET");
    const raw = data?.instance?.state || data?.state || "close";
    return { state: raw as string };
  } catch {
    return { state: "close" as const };
  }
}

export async function deleteInstance(instanceName: string) {
  try {
    await whatsApiRequest(`/instance/delete/${instanceName}`, "DELETE");
    return true;
  } catch {
    return false;
  }
}

// ─── Mensagens ─────────────────────────────────────────────────

export async function sendTextMessage(instanceName: string, number: string, text: string) {
  return whatsApiRequest(`/message/sendText/${instanceName}`, "POST", {
    number: number,
    options: {
      delay: 1200,
      presence: "composing",
      linkPreview: true
    },
    textMessage: {
      text: text
    }
  });
}

export async function sendMediaMessage(instanceName: string, number: string, base64: string, fileName: string, caption?: string) {
  // O base64 deve vir com o prefixo 'data:...;base64,' ou apenas a string raw
  const rawBase64 = base64.replace(/^data:.*?;base64,/, "");
  
  return whatsApiRequest(`/message/sendMedia/${instanceName}`, "POST", {
    number: number,
    options: {
      delay: 1500,
      presence: "composing"
    },
    mediaMessage: {
       mediatype: "document", // Enviamos como documento para manter qualidade e compatibilidade (PDF/IMG)
       caption: caption || "",
       media: rawBase64,
       fileName: fileName
    }
  });
}
