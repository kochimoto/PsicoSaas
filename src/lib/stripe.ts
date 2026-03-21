import Stripe from "stripe";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  return new Stripe(key || "sk_test_placeholder", {
    apiVersion: "2026-02-25.clover",
    appInfo: {
      name: "PsicoGestão",
      version: "0.1.0",
    },
  });
};

export const stripe = getStripe();
