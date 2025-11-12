import { useState, useCallback } from "react";
import {
  stripeRepository,
  type CheckoutSessionData,
  type PaymentIntentData,
} from "@/repositories/stripeRepository";

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(
    async (data: PaymentIntentData): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await stripeRepository.createPaymentIntent(data);

        if (!result || !result.clientSecret) {
          setError("Failed to create payment intent");
          return null;
        }

        return result.clientSecret;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createCheckoutSession = useCallback(
    async (data: CheckoutSessionData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await stripeRepository.createCheckoutSession(data);

        if (!result || !result.url) {
          setError("Failed to create checkout session");
          return false;
        }

        // Redirect to Stripe checkout
        stripeRepository.redirectToCheckout(result.url);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    createPaymentIntent,
    createCheckoutSession,
  };
};
