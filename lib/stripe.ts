import Stripe from 'stripe';

// ビルド時には環境変数がない場合があるため、lazy initialization
let stripe: Stripe | null = null;

export function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return stripe;
}

export const PLATFORM_FEE_PERCENTAGE = 0.15; // 15%の手数料

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE);
}

export function calculateSellerAmount(totalAmount: number): number {
  return totalAmount - calculatePlatformFee(totalAmount);
}