const WHATS_API_URL = process.env.WHATS_API_URL;
const WHATS_API_KEY = process.env.WHATS_API_KEY;

export async function whatsApiRequest(endpoint: string, method = "GET", body?: any) {
  if (!WHATS_API_URL || !WHATS_API_KEY) {
    throw new Error("WHATS_API_URL or WHATS_API_KEY not found in environment variables");
  }

  const url = `${WHATS_API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": WHATS_API_KEY
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("WhatsApp API Error:", errorData);
    throw new Error(`WhatsApp API request failed: ${response.statusText}`);
  }

  return response.json();
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
    number,
    text,
    linkPreview: true
  });
}
