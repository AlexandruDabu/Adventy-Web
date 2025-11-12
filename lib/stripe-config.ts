/**
 * Stripe Configuration
 * Centralized Stripe price IDs for easy management
 */

export const STRIPE_PRICES = {
  STANDARD: {
    amount: 3.99,
    priceId: "price_1SSZqzCsP0xYk7X1yj6CKgVV",
    donation: 1,
  },
  PREMIUM: {
    amount: 6.99,
    priceId: "price_1SSZrXCsP0xYk7X1x5JyMnux",
    donation: 4,
  },
  GIFT: {
    amount: 9.99,
    priceId: "price_1SSaXzCsP0xYk7X1FI2THiuJ",
    donation: 5,
  },
} as const;

export function getPriceId(amount: number): string {
  if (amount === STRIPE_PRICES.GIFT.amount) {
    return STRIPE_PRICES.GIFT.priceId;
  }
  if (amount === STRIPE_PRICES.PREMIUM.amount) {
    return STRIPE_PRICES.PREMIUM.priceId;
  }
  return STRIPE_PRICES.STANDARD.priceId;
}
