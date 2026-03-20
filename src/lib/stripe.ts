import Stripe from "stripe";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  return new Stripe(key || "sk_test_placeholder", {
    apiVersion: "2024-12-18.acacia",
    appInfo: {
      name: "PsicoSAAS",
      version: "0.1.0"
    }
  });
};

export const stripe = getStripe();
