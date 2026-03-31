import { differenceInDays } from "date-fns";

export function isVip(tenant: { plan: string; createdAt: Date }) {
  if (!tenant) return false;
  if (tenant.plan !== "FREE") return true;

  // Lógica de Trial de 7 dias
  const trialDaysLimit = 7;
  const daysSinceCreated = differenceInDays(new Date(), new Date(tenant.createdAt));
  return daysSinceCreated < trialDaysLimit;
}

export function getPlanLabel(tenant: { plan: string; createdAt: Date }) {
  if (!tenant) return "Plano FREE";
  
  if (tenant.plan !== "FREE") {
    return `Plano ${tenant.plan.replace('_', ' ')}`;
  }

  // Verifica se ainda está no Trial
  const trialDaysLimit = 7;
  const daysSinceCreated = differenceInDays(new Date(), new Date(tenant.createdAt));
  if (daysSinceCreated < trialDaysLimit) {
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
