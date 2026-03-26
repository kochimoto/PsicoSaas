import dns from 'dns/promises';

const WHATS_API_KEY = process.env.WHATS_API_KEY || "123456";

// Cache do token em memória RAM (se reiniciar o container, ele gera outro)
let cachedWppToken: string | null = null;

async function getBaseUrl() {
  let apiUrl = "http://wppconnect:21465";
  if (process.env.NODE_ENV === "production") {
    try {
      // Bypass IPv6 do Undici no Next.js (mesma segurança contra loops Docker)
      const lookup = await dns.lookup("wppconnect", { family: 4 });
      apiUrl = `http://${lookup.address}:21465`;
    } catch(e) {
      console.log("DNS lookup fallback para hostname nativo");
    }
  }
  return apiUrl;
}

export async function getWppToken() {
  if (cachedWppToken) return cachedWppToken;
  const baseUrl = await getBaseUrl();
  console.log(`Tentando gerar token no WPPConnect: ${baseUrl}`);
  
  // O WPPConnect moderno prefere o segredo no corpo (JSON) para evitar erros de URL
  const res = await fetch(`${baseUrl}/api/generate-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret: WHATS_API_KEY,
      sessionName: "psicosaas"
    })
  });
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("Erro ao gerar token WPP:", res.status, errText);
    throw new Error(`Falha ao gerar o token: ${res.status}`);
  }
  
  const data = await res.json();
  cachedWppToken = data.token;
  console.log("Token WPP gerado com sucesso");
  return cachedWppToken;
}

export async function createInstance(instanceName: string) {
  const baseUrl = await getBaseUrl();
  const token = await getWppToken();
  const res = await fetch(`${baseUrl}/api/${instanceName}/start-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao criar a sessão no WhatsApp Engine.");
  const data = await res.json();
  return data;
}

export async function connectInstance(instanceName: string) {
  return createInstance(instanceName);
}

export async function getConnectionState(instanceName: string) {
  try {
    const baseUrl = await getBaseUrl();
    const token = await getWppToken();
    const res = await fetch(`${baseUrl}/api/${instanceName}/status-session`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return { instance: { state: "close" } };
    const data = await res.json();
    return {
      instance: {
        state: data.status === "CONNECTED" ? "open" : "close"
      }
    };
  } catch (e) {
    return { instance: { state: "close" } };
  }
}

export async function sendTextMessage(instanceName: string, number: string, text: string) {
  const baseUrl = await getBaseUrl();
  const token = await getWppToken();
  const res = await fetch(`${baseUrl}/api/${instanceName}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      phone: number,
      message: text,
      isGroup: false
    })
  });
  
  if (!res.ok) {
     throw new Error("Erro ao enviar mensagem via WPPConnect");
  }
  return res.json();
}
