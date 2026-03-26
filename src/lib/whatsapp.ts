import dns from 'dns/promises';

const WHATS_API_KEY = "THISISMYSECURETOKEN"; // Padrão de fábrica do WPPConnect Server

// Removido cache global para evitar conflito de 401 entre sessões
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

export async function getWppToken(sessionName: string) {
  const baseUrl = await getBaseUrl();
  const url = `${baseUrl}/api/${sessionName}/${WHATS_API_KEY}/generate-token`;
  console.log(`Gerando token WPP via URL: ${url}`);
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  
  if (!res.ok) {
    const errText = await res.text();
    console.error("Erro ao gerar token WPP:", res.status, errText);
    throw new Error(`Falha ao gerar o token (${res.status}): ${errText}`);
  }
  
  const data = await res.json();
  return data.token;
}

export async function createInstance(instanceName: string) {
  const baseUrl = await getBaseUrl();
  const token = await getWppToken(instanceName);
  const res = await fetch(`${baseUrl}/api/${instanceName}/start-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`,
      waitQrCode: true
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("Erro WPP Start Session:", res.status, errData);
    throw new Error(`Erro ao iniciar sessão (${res.status}): ${errData.message || "Verifique os logs do servidor"}`);
  }
  const data = await res.json();
  console.log("WPP Session Result:", JSON.stringify(data).substring(0, 500)); // Log for debugging
  return data;
}

export async function connectInstance(instanceName: string) {
  return createInstance(instanceName);
}

export async function getConnectionState(instanceName: string) {
  try {
    const baseUrl = await getBaseUrl();
    const token = await getWppToken(instanceName);
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
  const token = await getWppToken(instanceName);
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
