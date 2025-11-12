"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Gift, Calendar } from "lucide-react";
import Lottie from "lottie-react";
import snowmanAnimation from "@/public/snowman.json";
type CountdownScreenProps = {
  userEmail: string;
};

export function CountdownScreen({ userEmail }: CountdownScreenProps) {
  const [timeUntilDecember, setTimeUntilDecember] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const december1st = new Date(now.getFullYear(), 11, 1);

      if (now > december1st) {
        december1st.setFullYear(december1st.getFullYear() + 1);
      }

      const difference = december1st.getTime() - now.getTime();

      setTimeUntilDecember({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/10'>
      <div className='w-full max-w-4xl space-y-8 md:space-y-12 animate-in fade-in duration-700'>
        {/* Success message */}
        <div className='text-center space-y-4 md:space-y-6'>
          <div className='inline-block animate-bounce'>
            <Gift className='w-16 h-16 md:w-20 md:h-20 text-primary mx-auto' />
          </div>

          <h1 className='font-display text-5xl md:text-8xl text-primary'>
            Welcome Aboard!
          </h1>

          <div className='space-y-4 max-w-2xl mx-auto'>
            <p className='text-lg md:text-2xl text-foreground text-balance'>
              You've successfully enrolled in your personalized 24-day advent
              calendar journey!
            </p>
            <p className='text-base md:text-xl text-muted-foreground text-balance'>
              Everything begins on December 1st. You'll receive an email at{" "}
              <span className='text-primary font-medium'>{userEmail}</span> to
              start your festive adventure with your first personalized
              surprise.
            </p>
          </div>
        </div>

        {/* Countdown timer */}
        <div className='space-y-4 md:space-y-6'>
          <div className='text-center'>
            <h3 className='text-lg md:text-xl text-foreground mb-4 md:mb-6 flex items-center justify-center gap-2'>
              <Calendar className='w-5 h-5 md:w-6 md:h-6 text-primary' />
              Your Journey Begins In
            </h3>
          </div>

          <div className='grid grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto'>
            {[
              { label: "Days", value: timeUntilDecember.days },
              { label: "Hours", value: timeUntilDecember.hours },
              { label: "Minutes", value: timeUntilDecember.minutes },
              { label: "Seconds", value: timeUntilDecember.seconds },
            ].map((item) => (
              <Card key={item.label} className='p-3 md:p-6 bg-card text-center'>
                <div className='text-2xl md:text-5xl font-light text-primary mb-1 md:mb-2'>
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className='text-xs md:text-sm text-muted-foreground uppercase tracking-wide'>
                  {item.label}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className='text-center space-y-3 md:space-y-4'>
          <p className='text-base md:text-lg text-foreground font-medium'>
            Get ready for 24 days of personalized joy
          </p>
          <div className='flex justify-center items-center'>
            <div className='w-80 h-80 md:w-96 md:h-96'>
              <Lottie animationData={snowmanAnimation} loop={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
