/**
 * Evolution API v2 — Biblioteca de integração WhatsApp (RESTORED STABLE VERSION)
 */

const WHATS_API_URL = process.env.WHATS_API_URL || "http://evolution:8080";
const WHATS_API_KEY = process.env.WHATS_API_KEY || "123456";

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  // Lista de URLs para tentar em ordem de prioridade
  const targets = [
    "http://evolution:8080",                       // 1. Prioridade: Nome interno do container
    WHATS_API_URL,                                  // 2. Configuração do ENV
    "http://163.245.202.150:8080"                  // 3. IP Público como fallback
  ];

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATS_API_KEY
    },
    cache: "no-store",
    // 10 segundos por tentativa (rede interna é instantânea)
    signal: AbortSignal.timeout(10000)
  };

  if (body) options.body = JSON.stringify(body);

  let lastError: any = null;

  for (const baseUrl of targets) {
    if (!baseUrl) continue;
    
    // Evita duplicidade se WHATS_API_URL for igual a evolution:8080
    if (baseUrl === "http://evolution:8080" && targets.indexOf(baseUrl) > 0) continue;

    const url = `${baseUrl.replace(/\/$/, "")}${endpoint}`;
    console.log(`[WA] Attempting ${method} ${url}...`);

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      
      console.log(`[WA] Response from ${url} [Status: ${response.status}]:`, JSON.stringify(data).substring(0, 500));

      if (response.ok) {
        console.log(`[WA] Success on ${url}`);
        return data;
      }
      
      lastError = new Error(`[Status: ${response.status}] ${data?.message || response.statusText}`);
      
      // Se for um erro de autenticação ou parâmetro errado na API, para de tentar outras URLs
      if (response.status === 401 || response.status === 403 || response.status === 400) {
        break;
      }
    } catch (error: any) {
      console.error(`[WA] Failed to connect to ${url}:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`Falha total de conexão com Evolution API. Tentativas esgotadas. Último erro: ${lastError?.message}`);
}

// ─── Instâncias ────────────────────────────────────────────────

export async function createInstance(instanceName: string) {
  return whatsApiRequest("/instance/create", "POST", {
    instanceName: instanceName,
    token: WHATS_API_KEY,
    integration: "WHATSAPP-BAILEYS", // Campo OBRIGATÓRIO na v2.2.3
    qrcode: true,
  });
}

export async function getQrCode(instanceName: string): Promise<string | null> {
  try {
    const data = await whatsApiRequest(`/instance/connect/${instanceName}`, "GET");
    
    // LOG DE DEBUG PARA VER O PAYLOAD REAL
    console.log(`[WA] getQrCode data from ${instanceName}:`, JSON.stringify(data).substring(0, 1000));

    // Na v2.2.3 o QR vem em data.base64 ou data.qrcode.base64
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
    
    // Mapeamento v2
    const raw = data?.instance?.state || data?.state || "close";
    return { 
      state: raw === "open" ? "open" : (raw === "connecting" ? "initializing" : "close")
    };
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
    text: text, 
    delay: 1200,
    linkPreview: true
  });
}

export async function sendMediaMessage(instanceName: string, number: string, base64: string, fileName: string, caption?: string) {
  const rawBase64 = base64.replace(/^data:.*?;base64,/, "");
  
  return whatsApiRequest(`/message/sendMedia/${instanceName}`, "POST", {
    number: number,
    mediatype: "document", 
    caption: caption || "",
    media: rawBase64,
    fileName: fileName,
    delay: 1500
  });
}
