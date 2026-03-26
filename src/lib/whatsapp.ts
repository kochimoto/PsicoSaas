function getBaseUrl() {
  // Usa WHATS_API_URL se definido; dentro do Docker usa o nome do serviço
  return process.env.WHATS_API_URL || "http://evolution:8080";
}

const EVOLUTION_API_KEY = process.env.WHATS_API_KEY || "123456";

export async function createInstance(instanceName: string) {
  const baseUrl = getBaseUrl();
  
  // Primeiro, tentamos criar a instância
  const res = await fetch(`${baseUrl}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY
    },
    cache: "no-store",
    body: JSON.stringify({
      instanceName: instanceName,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true
    })
  });

  const data = await res.json();
  
  // Se já existe, apenas ignoramos o erro de conflito e seguimos
  if (!res.ok && res.status !== 403 && res.status !== 409) {
    console.error("Erro Evolution Create:", res.status, data);
    throw new Error(`Erro ao criar instância (${res.status})`);
  }

  return data;
}

export async function connectInstance(instanceName: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/instance/connect/${instanceName}`, {
    method: "GET",
    headers: { "apikey": EVOLUTION_API_KEY },
    cache: "no-store"
  });

  if (!res.ok) {
     // Se falhar, tenta recriar/reiniciar
     return createInstance(instanceName);
  }

  return res.json();
}

export async function getConnectionState(instanceName: string) {
  try {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      method: "GET",
      headers: { "apikey": EVOLUTION_API_KEY },
      cache: "no-store"
    });
    
    if (!res.ok) return { instance: { state: "close" } };
    
    const data = await res.json();
    return {
      instance: {
        state: data.instance?.state === "open" ? "open" : (data.instance?.state === "connecting" ? "initializing" : "close")
      },
      qrcode: data.instance?.qrcode || null,
      rawStatus: data.instance?.state
    };
  } catch (e) {
    return { instance: { state: "close" } };
  }
}

export async function sendTextMessage(instanceName: string, number: string, text: string) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY
    },
    cache: "no-store",
    body: JSON.stringify({
      number: number,
      text: text,
      delay: 1200,
      linkPreview: true
    })
  });
  
  if (!res.ok) {
     const err = await res.json().catch(() => ({}));
     console.error("Erro Evolution Send:", res.status, err);
     throw new Error("Erro ao enviar mensagem via Evolution API");
  }
  return res.json();
}
