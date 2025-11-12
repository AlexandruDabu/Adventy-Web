"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Gift, Mail } from "lucide-react";
import { useUser } from "@/hooks/useUser";

type EmailCollectionScreenProps = {
  onSubmit: (email: string) => void;
  currentStep: number;
  totalSteps: number;
};

export function EmailCollectionScreen({
  onSubmit,
  currentStep,
  totalSteps,
}: EmailCollectionScreenProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showAlreadyPaidPopup, setShowAlreadyPaidPopup] = useState(false);
  const { checkIfUserPaid, loading } = useUser();

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if user already exists and paid
    const { exists, paid } = await checkIfUserPaid(email);

    if (exists && paid) {
      // Show popup that they already purchased
      setShowAlreadyPaidPopup(true);
      return;
    }

    // Continue to next step
    onSubmit(email);
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-secondary/20'>
      {/* Already Paid Popup */}
      {showAlreadyPaidPopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300'>
          <Card className='w-full max-w-md mx-4 p-8 space-y-6 animate-in zoom-in duration-300 bg-card border-2 border-primary shadow-2xl'>
            <div className='text-center space-y-4'>
              <div className='inline-block animate-bounce'>
                <Gift className='w-16 h-16 md:w-20 md:h-20 text-primary mx-auto' />
              </div>
              <h2 className='font-display text-4xl text-primary'>
                Already Enrolled!
              </h2>
              <p className='text-lg text-foreground'>
                You've already purchased your personalized advent calendar!
                You'll receive an email on{" "}
                <span className='font-bold text-primary'>December 1st</span>{" "}
                with access to the app when everything starts.
              </p>
              <p className='text-md text-muted-foreground'>
                Email:{" "}
                <span className='font-medium text-foreground'>{email}</span>
              </p>
            </div>
            <Button
              onClick={() => setShowAlreadyPaidPopup(false)}
              className='w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground'
            >
              Got It!
            </Button>
          </Card>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='w-full max-w-2xl'
      >
        {/* Progress bar */}
        <div className='mb-12'>
          <div className='flex justify-between items-center mb-3'>
            <span className='text-sm text-muted-foreground'>
              Question {currentStep} of {totalSteps}
            </span>
            <span className='text-sm text-primary font-medium'>
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className='h-2 bg-muted rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-gradient-to-r from-primary to-accent'
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className='bg-card rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/10'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='space-y-8'
          >
            <div className='space-y-4 text-center'>
              <Mail className='w-16 h-16 text-primary mx-auto mb-4' />
              <h2 className='font-display text-4xl md:text-5xl text-primary'>
                Almost There!
              </h2>
              <p className='text-lg md:text-xl text-muted-foreground text-balance'>
                Where should we send your personalized advent calendar?
              </p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Input
                  type='email'
                  placeholder='your.email@example.com'
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className='h-14 text-lg border-2 border-primary/20 focus:border-primary rounded-xl'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-sm text-red-500'
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className='w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50'
              >
                {loading ? "Checking..." : "Continue to Your Calendar"}
              </Button>
            </div>

            <p className='text-center text-sm text-muted-foreground'>
              We'll only send you your advent calendar surprises, nothing else.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
