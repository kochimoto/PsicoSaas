const WHATS_API_URL = process.env.WHATS_API_URL;
const WHATS_API_KEY = process.env.WHATS_API_KEY;

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  let apiUrl = WHATS_API_URL;
  
  // Docker DNS fallback bypass (força o tráfego pela interface pública da VPS)
  if (process.env.NODE_ENV === "production" && (apiUrl?.includes("laisbritoofc.com.br") || apiUrl?.includes("evolution"))) {
    apiUrl = "http://163.245.202.150:8080"; // VPS Public IP
  }

  if (!apiUrl || !WHATS_API_KEY) {
    throw new Error("WHATS_API_URL or WHATS_API_KEY not found in environment variables");
  }

  const url = `${apiUrl.replace(/\/$/, "")}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATS_API_KEY as string
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
      console.error("WhatsApp API Error Response:", response.status, errorData);
      throw new Error(`[Status: ${response.status}] ${errorData?.message?.message || errorData?.message || response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error("WhatsApp API Network/Fetch Error:", error.message);
    throw new Error(`Falha de conexão com a Evolution API: ${error.message} (URL: ${url})`);
  }
}

/**
 * Cria uma nova instância para o psicólogo (equivalente a "logar" o WhatsApp dele)
 */
export async function createInstance(instanceName: string) {
  return whatsApiRequest("/instance/create", "POST", {
    instanceName,
    token: WHATS_API_KEY, // Opcional, mas útil
    qrcode: true
  });
}

export async function connectInstance(instanceName: string) {
  return whatsApiRequest(`/instance/connect/${instanceName}`);
}

/**
 * Pega o QR Code ou status da conexão
 */
export async function getConnectionState(instanceName: string) {
  return whatsApiRequest(`/instance/connectionState/${instanceName}`);
}

/**
 * Envia uma mensagem de texto simples
 */
export async function sendTextMessage(instanceName: string, number: string, text: string) {
  // O número precisa estar no formato: 5511999999999 (DDI + DDD + Número)
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
