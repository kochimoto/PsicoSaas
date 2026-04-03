import { differenceInDays } from "date-fns";

export function isVip(tenant: { plan: string; createdAt: Date; planExpiresAt?: Date | null }) {
  if (!tenant) return false;

  // Se tem data de expiração e ainda não venceu, é VIP
  if (tenant.planExpiresAt && new Date(tenant.planExpiresAt) > new Date()) {
    return true;
  }

  // Se o plano explicitamente não for FREE, é VIP (legado/stripe)
  if (tenant.plan !== "FREE") return true;

  // Lógica de Trial de 7 dias
  const trialDaysLimit = 7;
  const daysSinceCreated = differenceInDays(new Date(), new Date(tenant.createdAt));
  return daysSinceCreated < trialDaysLimit;
}

export function getPlanLabel(tenant: { plan: string; createdAt: Date; planExpiresAt?: Date | null }) {
  if (!tenant) return "Plano FREE";
  
  const activeVip = isVip(tenant);

  if (tenant.planExpiresAt && new Date(tenant.planExpiresAt) > new Date()) {
    return `Plano VIP (Expira em ${new Date(tenant.planExpiresAt).toLocaleDateString('pt-BR')})`;
  }

  if (tenant.plan !== "FREE") {
    return `Plano ${tenant.plan.replace('_', ' ')}`;
  }

  if (activeVip) {
    return "Plano VIP (Período de teste)";
  }

  return "Plano FREE";
}

export function getRemainingTrialDays(createdAt: Date) {
  const trialDaysLimit = 7;
  const daysSinceCreated = differenceInDays(new Date(), new Date(createdAt));
  const remaining = trialDaysLimit - daysSinceCreated;
  return remaining > 0 ? remaining : 0;
}
