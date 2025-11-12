"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Check if Stripe key is available
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set!");
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type PaymentFormProps = {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
};

function PaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onClose,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}?payment_success=true`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
      } else {
        // Payment successful
        onSuccess();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <ExpressCheckoutElement
        onConfirm={async (event) => {
          if (!stripe || !elements) {
            return;
          }

          setIsProcessing(true);
          setErrorMessage(null);

          try {
            const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}?payment_success=true`,
              },
              redirect: "if_required",
            });

            if (error) {
              setErrorMessage(error.message || "Payment failed");
              setIsProcessing(false);
            } else {
              onSuccess();
            }
          } catch (err) {
            setErrorMessage("An unexpected error occurred");
            setIsProcessing(false);
          }
        }}
        options={{
          wallets: {
            applePay: "auto",
            googlePay: "never",
          },
        }}
      />

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or pay with card
          </span>
        </div>
      </div>

      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
        }}
        onReady={() => console.log("PaymentElement ready")}
        onLoadError={(error) => console.error("PaymentElement error:", error)}
      />

      {errorMessage && (
        <div className='text-sm text-red-500 bg-red-50 p-3 rounded-lg'>
          {errorMessage}
        </div>
      )}

      <div className='flex gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={isProcessing}
          className='flex-1'
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={!stripe || isProcessing}
          className='flex-1 bg-festive hover:bg-festive/90'
        >
          {isProcessing ? (
            <span className='flex items-center gap-2'>
              <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              Processing...
            </span>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

type PaymentDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientSecret: string | null;
  amount: number;
};

export function PaymentDrawer({
  open,
  onClose,
  onSuccess,
  clientSecret,
  amount,
}: PaymentDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className='max-h-[85vh] flex flex-col'>
        <DrawerHeader className='text-left shrink-0'>
          <DrawerTitle className='text-2xl'>Complete Payment</DrawerTitle>
          <DrawerDescription>
            Secure payment powered by Stripe. Supports cards, Apple Pay, Link,
            and more.
          </DrawerDescription>
          <DrawerClose className='absolute right-4 top-4'>
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </DrawerClose>
        </DrawerHeader>

        <div className='px-4 pb-4 overflow-y-auto flex-1'>
          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#8b0000",
                    fontFamily: "system-ui, sans-serif",
                  },
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                amount={amount}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <div className='flex items-center justify-center py-8'>
              <div className='w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin' />
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
