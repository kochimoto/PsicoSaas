/**
 * Evolution API v2 — Biblioteca de integração WhatsApp (RESTORED STABLE VERSION)
 */

const WHATS_API_URL = (process.env.WHATS_API_URL || "http://evolution:8080").replace(/\/$/, "");
const WHATS_API_KEY = (process.env.WHATS_API_KEY || "123456").replace(/"/g, "").trim();

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  // Lista de URLs para tentar em ordem de prioridade
  const targets = [
    "http://evolution:8080",                       // 1. Prioridade: Nome interno do container
    WHATS_API_URL,                                  // 2. Configuração do ENV (ex: evolution:8080)
    "http://172.18.0.1:8080",                      // 3. Gateway comum do Docker Compose
    "http://172.17.0.1:8080",                      // 4. Gateway padrão do Docker
    "http://163.245.202.150:8080"                  // 5. IP Público como fallback
  ];

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATS_API_KEY,      // Padrão Evolution v2 e v1.8
      "token": WHATS_API_KEY       // Fallback para algums builds de v1.8
    },
    cache: "no-store",
    // Removido sinal de timeout para evitar Erro de Tentativas Esgotadas em redes lentas
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
    instanceName,
    token: WHATS_API_KEY,
    qrcode: true,
  });
}

export async function getQrCode(instanceName: string): Promise<string | null> {
  try {
    const data = await whatsApiRequest(`/instance/connect/${instanceName}`, "GET");
    
    // Na v1.8 o QR costuma vir em qrcode.base64 ou base64 direto
    const raw = data?.base64 || data?.qrcode?.base64 || data?.code;

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
    // Mapeamento v1.8: 'open', 'connecting', 'close'
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
