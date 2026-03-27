/**
 * Evolution API v2 — Biblioteca de integração WhatsApp (RESTORED STABLE VERSION)
 */

const WHATS_API_URL = (process.env.WHATS_API_URL || "http://evolution:8080").replace(/\/$/, "");
const WHATS_API_KEY = (process.env.WHATS_API_KEY || "123456").replace(/"/g, "").trim();

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  const url = `http://evolution:8080${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATS_API_KEY
    },
    cache: "no-store",
  };

  if (body) options.body = JSON.stringify(body);

  console.log(`[WA] Request: ${method} ${url}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    
    if (response.ok) {
      return data;
    }
    
    console.error(`[WA] Response Error [Status: ${response.status}]:`, data);
    throw new Error(`[Status: ${response.status}] ${data?.message || response.statusText}`);
  } catch (error: any) {
    console.error(`[WA] Failed to connect to ${url}:`, error.message);
    throw error;
  }
}

// ─── Instâncias ────────────────────────────────────────────────

export async function createInstance(instanceName: string) {
  try {
    return await whatsApiRequest("/instance/create", "POST", {
      instanceName,
      token: WHATS_API_KEY,
      qrcode: true,
    });
  } catch (error: any) {
    if (error.message.includes("400")) {
      console.warn(`[WA] Instance ${instanceName} might exist. Retrying after delete...`);
      await deleteInstance(instanceName).catch(() => {});
      return await whatsApiRequest("/instance/create", "POST", {
        instanceName,
        token: WHATS_API_KEY,
        qrcode: true,
      });
    }
    throw error;
  }
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
  const rawBase64 = base64.replace(/^data:.*?;base64,/, "");
  
  return whatsApiRequest(`/message/sendMedia/${instanceName}`, "POST", {
    number: number,
    options: {
      delay: 1500,
      presence: "composing"
    },
    mediaMessage: {
       mediatype: "document",
       caption: caption || "",
       media: rawBase64,
       fileName: fileName
    }
  });
}
