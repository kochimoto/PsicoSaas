/**
 * Evolution API v2 — Biblioteca de integração WhatsApp (RESTORED STABLE VERSION)
 */

const WHATS_API_URL = (process.env.WHATS_API_URL || "http://evolution:8080").replace(/\/$/, "");
const WHATS_API_KEY = (process.env.WHATS_API_KEY || "123456").replace(/"/g, "").trim();

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  const url = `${WHATS_API_URL}${endpoint}`;
  
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
    
    // Melhora o report de erro para ler arrays internos (comum na Evolution)
    let errMsg = response.statusText;
    if (data?.message) {
      if (Array.isArray(data.message)) {
        errMsg = data.message.join(", ");
      } else {
        errMsg = typeof data.message === 'object' ? JSON.stringify(data.message) : data.message;
      }
    } else if (data?.response?.message) {
      // Formato common em algumas versões: data.response.message
      const msg = data.response.message;
      errMsg = Array.isArray(msg) ? msg.join(", ") : String(msg);
    }
    
    console.error(`[WA] Response Error [Status: ${response.status}]:`, JSON.stringify(data));
    throw new Error(`[Status: ${response.status}] ${errMsg}`);
  } catch (error: any) {
    console.error(`[WA] Failed to connect to ${url}:`, error.message);
    throw error;
  }
}

// ─── Instâncias ────────────────────────────────────────────────

export async function createInstance(instanceName: string) {
  console.log(`[WA] createInstance: Creating ${instanceName}...`);
  try {
    return await whatsApiRequest("/instance/create", "POST", {
      instanceName,
      qrcode: true,
    });
  } catch (error: any) {
    if (error.message.includes("400")) {
      console.warn(`[WA] Instance ${instanceName} conflict. Forcing delete and retry...`);
      await deleteInstance(instanceName).catch(() => {});
      return await whatsApiRequest("/instance/create", "POST", {
        instanceName,
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

export async function logoutInstance(instanceName: string) {
  try {
    await whatsApiRequest(`/instance/logout/${instanceName}`, "DELETE");
    return true;
  } catch (err: any) {
    console.warn(`[WA] Logout failed (expected if already disconnected):`, err.message);
    return false;
  }
}

export async function deleteInstance(instanceName: string) {
  try {
    // Tenta logout primeiro para limpar arquivos de sessão/memória
    await logoutInstance(instanceName).catch(() => {});
    
    await whatsApiRequest(`/instance/delete/${instanceName}`, "DELETE");
    return true;
  } catch (err: any) {
    console.error(`[WA] Delete failed:`, err.message);
    return false;
  }
}

// ─── Mensagens ─────────────────────────────────────────────────

export async function sendTextMessage(instanceName: string, number: string, text: string) {
  const cleanNumber = number.replace(/\D/g, "");
  
  // Payload Estável v1.8.2
  return whatsApiRequest(`/message/sendText/${instanceName}`, "POST", {
    number: cleanNumber,
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
  const cleanNumber = number.replace(/\D/g, "");
  
  return whatsApiRequest(`/message/sendMedia/${instanceName}`, "POST", {
    number: cleanNumber,
    mediaMessage: {
       mediatype: "document",
       caption: caption || "",
       media: rawBase64,
       fileName: fileName
    }
  });
}
