"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Gift, Heart, Smartphone } from "lucide-react";
import Lottie from "lottie-react";
import starAnimation from "@/public/star.json";
import { useStripe } from "@/hooks/useStripe";
import { useUser } from "@/hooks/useUser";
import { PaymentDrawer } from "@/components/payment-drawer";
import {
  identifyUser,
  sendEcommerceEvent,
  TikTokEvent,
} from "@/utils/tiktokPixel";

type PaywallScreenProps = {
  userEmail: string;
  calendarTemplateId: string;
  answers?: Record<string, any>;
};

export function PaywallScreen({
  userEmail,
  calendarTemplateId,
  answers,
}: PaywallScreenProps) {
  const router = useRouter();
  const [selectedPrice, setSelectedPrice] = useState<number | null>(6.99);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [friendEmail, setFriendEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const { createPaymentIntent, loading } = useStripe();
  const { updateUserPaid, createGiftRecipient } = useUser();
  const ctaButtonRef = useRef<HTMLDivElement>(null);

  // Identify user with TikTok Pixel when component mounts
  useEffect(() => {
    if (userEmail) {
      identifyUser({ email: userEmail });
    }
  }, [userEmail]);

  const handlePriceSelection = (price: number) => {
    setSelectedPrice(price);

    // Scroll to CTA button if not gift option
    if (price !== 9.99) {
      setTimeout(() => {
        ctaButtonRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPrice) return;

    // Validate friend email if gift option is selected
    if (selectedPrice === 9.99) {
      if (!friendEmail) {
        setEmailError("Please enter your friend's email");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(friendEmail)) {
        setEmailError("Please enter a valid email address");
        return;
      }
      if (friendEmail.toLowerCase() === userEmail.toLowerCase()) {
        setEmailError("Friend's email must be different from yours");
        return;
      }
    }

    // Send InitiateCheckout event to TikTok Pixel (once, when button is clicked)
    sendEcommerceEvent(
      TikTokEvent.INITIATE_CHECKOUT,
      "advent-calendar",
      "Personalized Advent Calendar",
      selectedPrice,
      "USD"
    );

    console.log("Creating payment intent for:", {
      amount: selectedPrice,
      email: userEmail,
      friendEmail: selectedPrice === 9.99 ? friendEmail : undefined,
    });

    // Create payment intent for embedded checkout
    const secret = await createPaymentIntent({
      amount: selectedPrice,
      email: userEmail,
      calendarTemplateId,
      friendEmail: selectedPrice === 9.99 ? friendEmail : undefined,
      answers,
    });

    console.log("Received client secret:", secret ? "✓" : "✗");

    if (secret) {
      setClientSecret(secret);
      setShowPaymentDrawer(true);
    } else {
      console.error("Failed to get client secret");
    }
  };

  const handlePaymentSuccess = async () => {
    // Send Purchase event to TikTok Pixel
    if (selectedPrice) {
      sendEcommerceEvent(
        TikTokEvent.PURCHASE,
        "advent-calendar",
        "Personalized Advent Calendar",
        selectedPrice,
        "USD"
      );
    }

    // Update buyer as paid in Supabase (gift: false for buyer)
    await updateUserPaid(userEmail, calendarTemplateId, false);

    // If this is a gift purchase, also create entry for the friend
    if (selectedPrice === 9.99 && friendEmail) {
      await createGiftRecipient(friendEmail, calendarTemplateId, answers);
      console.log("✅ Gift calendar created for friend:", friendEmail);
    }

    // Close drawer and redirect to home with success param
    setShowPaymentDrawer(false);
    router.push("/?payment_success=true");
  };

  const handleCloseDrawer = () => {
    setShowPaymentDrawer(false);
    setClientSecret(null);
  };

  const pricingOptions = [
    {
      price: 3.99,
      donation: 1,
      popular: false,
      gift: false,
    },
    {
      price: 6.99,
      donation: 4,
      popular: true,
      gift: false,
    },
    {
      price: 9.99,
      donation: 5,
      popular: false,
      gift: true,
    },
  ];

  const features = [
    "Personalized daily content",
    "Support a charitable cause",
    "24 days of joy and inspiration",
    "Access via our mobile app",
    "In-app challenges & rewards",
    "Start December 1st",
  ];

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20'>
      <div className='w-full max-w-3xl space-y-8 animate-in fade-in duration-700'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <h1 className='font-display text-6xl md:text-8xl text-primary'>
            Your Perfect Match
          </h1>
          <p className='text-xl md:text-2xl text-foreground max-w-2xl mx-auto text-balance'>
            We've crafted a personalized advent calendar just for you. Choose
            your contribution to unlock the magic.
          </p>
        </div>

        {/* Pricing cards */}
        <div className='grid md:grid-cols-3 gap-6'>
          {pricingOptions.map((option) => (
            <Card
              key={option.price}
              className={`p-8 cursor-pointer transition-all duration-300 hover:scale-[1.02] relative ${
                selectedPrice === option.price
                  ? "border-2 border-primary shadow-xl bg-primary/5"
                  : "hover:border-primary/50 bg-card"
              } ${option.popular ? "ring-2 ring-accent" : ""}`}
              onClick={() => handlePriceSelection(option.price)}
            >
              {option.popular && (
                <div className='absolute -top-3 left-1/2 -translate-x-1/2'>
                  <span className='bg-accent text-accent-foreground px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1'>
                    <div className='w-6 h-6'>
                      <Lottie animationData={starAnimation} loop={true} />
                    </div>
                    Popular
                  </span>
                </div>
              )}

              <div className='space-y-6'>
                <div className='text-center'>
                  <div className='text-5xl font-light text-foreground'>
                    ${option.price}
                  </div>
                  <div className='mt-4 flex items-center justify-center gap-2 text-accent'>
                    <div className='relative inline-flex items-center justify-center'>
                      <Heart className='w-4 h-4 fill-accent absolute animate-ping' />
                      <Heart className='w-5 h-5 fill-accent relative' />
                    </div>
                    <p className='text-lg font-semibold'>
                      ${option.donation} donated to charity
                    </p>
                  </div>
                  <p className='text-sm text-muted-foreground mt-2'>
                    Making a {option.popular ? "real" : ""} difference together
                  </p>
                  {option.gift && (
                    <div className='mt-3 pt-3 border-t border-primary/20'>
                      <div className='flex flex-col items-center justify-center gap-2 text-primary'>
                        Plus
                        <Gift className='w-8 h-8 animate-bounce' />
                        <p className='text-sm font-semibold text-center'>
                          Gift a Personalized Adventy Calendar to a friend!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-center'>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPrice === option.price
                        ? "border-primary bg-primary"
                        : "border-muted"
                    }`}
                  >
                    {selectedPrice === option.price && (
                      <Check className='w-4 h-4 text-primary-foreground' />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Friend Email Input (only for gift option) */}
        {selectedPrice === 9.99 && (
          <Card className='p-6 bg-card border-2 border-primary/20 animate-in slide-in-from-top duration-300'>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center'>
                  <Gift className='w-7 h-7 text-primary' />
                </div>
                <h3 className='text-lg font-semibold text-foreground'>
                  Gift a Calendar to Your Friend
                </h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Enter your friend's email to send them a personalized advent
                calendar as a gift!
              </p>
              <div className='space-y-2'>
                <Input
                  type='email'
                  placeholder='friend@example.com'
                  value={friendEmail}
                  onChange={(e) => {
                    setFriendEmail(e.target.value);
                    setEmailError("");
                  }}
                  className='h-12 text-base border-2 border-primary/20 focus:border-primary'
                />
                {emailError && (
                  <p className='text-sm text-red-500'>{emailError}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Features list */}
        <Card className='p-8 bg-card'>
          <div className='flex items-center justify-center gap-2 mb-6'>
            <Smartphone className='w-6 h-6 text-primary' />
            <h3 className='text-xl font-medium text-foreground text-center'>
              What's Included
            </h3>
          </div>
          <ul className='space-y-3'>
            {features.map((feature, index) => (
              <li key={index} className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-primary flex-shrink-0 mt-0.5' />
                <span className='text-foreground'>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* CTA Button */}
        <div ref={ctaButtonRef} className='text-center space-y-4'>
          <Button
            size='lg'
            disabled={!selectedPrice || loading}
            onClick={handlePurchase}
            className='w-full md:w-auto px-12 py-6 text-lg bg-festive hover:bg-festive/90 text-festive-foreground disabled:opacity-50'
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <div className='w-5 h-5 border-2 border-festive-foreground/30 border-t-festive-foreground rounded-full animate-spin' />
                Processing...
              </span>
            ) : (
              "Get Your Advent Calendar"
            )}
          </Button>

          <p className='text-sm text-muted-foreground'>
            Secure checkout • Start your journey December 1st
          </p>
        </div>

        <div className='text-center space-y-3'>
          <div className='flex items-center justify-center gap-2 text-accent'>
            <div className='relative inline-flex items-center justify-center'>
              <Heart className='w-3 h-3 fill-accent absolute animate-ping' />
              <Heart className='w-4 h-4 fill-accent relative' />
            </div>
            <p className='text-sm font-medium'>
              {selectedPrice === 9.99
                ? "$5 from your purchase"
                : selectedPrice === 6.99
                ? "$4 from your purchase"
                : selectedPrice === 3.99
                ? "$1 from your purchase"
                : "A portion of your purchase"}{" "}
              goes directly to holiday charities
            </p>
          </div>
          <p className='text-xs text-muted-foreground'>
            Verified donations • Full transparency
          </p>
          <p className='text-xs text-muted-foreground font-semibold mt-2'>
            {" "}
            No refunds available • All sales are final
          </p>
        </div>
      </div>

      {/* Embedded Payment Drawer */}
      <PaymentDrawer
        open={showPaymentDrawer}
        onClose={handleCloseDrawer}
        onSuccess={handlePaymentSuccess}
        clientSecret={clientSecret}
        amount={selectedPrice || 0}
        userEmail={userEmail}
      />
    </div>
  );
}
