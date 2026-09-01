import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripeClient() {
  if (stripe || !process.env.STRIPE_SECRET_KEY) {
    return stripe;
  }

  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 0,
    timeout: 10_000
  });

  return stripe;
}

export function hasStripeEnv() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
