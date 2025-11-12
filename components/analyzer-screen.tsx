"use client";

import { useEffect, useState, useRef } from "react";
import type { UserAnswers } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Lottie from "lottie-react";
import reindeerAnimation from "@/public/Reindeer.json";

type AnalyzerScreenProps = {
  answers: UserAnswers;
  onComplete: () => void;
};

const PHASES = [
  "Analyzing your preferences...",
  "Matching your personality...",
  "Selecting perfect content...",
  "Crafting your calendar...",
];

export function AnalyzerScreen({ answers, onComplete }: AnalyzerScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownPopupRef = useRef(false);
  const pausedAt20Ref = useRef(false);
  const pausedAt65Ref = useRef(false);
  const pausedAt90Ref = useRef(false);

  useEffect(() => {
    // Single progress bar with pauses at 20%, 65%, 90%
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Pause at 20% for 2 seconds
        if (prev >= 20 && !pausedAt20Ref.current) {
          pausedAt20Ref.current = true;
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), 2000);
          return 20;
        }

        // Pause at 65% for 2 seconds
        if (prev >= 65 && !pausedAt65Ref.current) {
          pausedAt65Ref.current = true;
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), 2000);
          return 65;
        }

        // Pause at 90% for 2 seconds and show popup
        if (prev >= 90 && !pausedAt90Ref.current) {
          pausedAt90Ref.current = true;
          hasShownPopupRef.current = true;
          setShowPopup(true);
          setIsPaused(true);
          return 90;
        }

        // Complete
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setTimeout(() => onComplete(), 500);
          return 100;
        }

        // Only increment if not paused
        if (!isPaused) {
          return prev + 0.25; // Slower but not too slow (was 0.4)
        }
        return prev;
      });
    }, 20);

    // Phase text rotation
    phaseIntervalRef.current = setInterval(() => {
      setCurrentPhase((prev) => (prev + 1) % PHASES.length);
    }, 800);

    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    };
  }, [onComplete, isPaused]);

  const handlePopupResponse = () => {
    setShowPopup(false);
    setIsPaused(false); // Resume progress
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-secondary/20'>
      {showPopup && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300'>
          <Card className='w-full max-w-md mx-4 p-8 space-y-6 animate-in zoom-in duration-300 bg-card border-2 border-primary shadow-2xl'>
            <div className='text-center space-y-4'>
              <div className='text-6xl mb-4'>🎁</div>
              <h2 className='font-display text-4xl text-primary'>
                Almost Ready!
              </h2>
              <p className='text-lg text-foreground'>
                Are you ready to get your personalized advent calendar?
              </p>
            </div>
            <Button
              onClick={handlePopupResponse}
              className='w-full py-6 text-lg bg-festive hover:bg-festive/90 text-festive-foreground'
            >
              Yes, I'm Ready!
            </Button>
          </Card>
        </div>
      )}

      <div className='w-full max-w-2xl space-y-12 animate-in fade-in duration-700'>
        <div className='text-center space-y-6'>
          <h1 className='font-display text-7xl md:text-8xl text-primary animate-pulse'>
            Creating Magic
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground'>
            {PHASES[currentPhase]}
          </p>
        </div>

        <div className='flex justify-center gap-3'>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='w-3 h-3 rounded-full bg-primary animate-bounce'
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>

        <div className='space-y-3'>
          <p className='text-sm text-muted-foreground font-medium'>
            Creating your personalized advent calendar...
          </p>
          <div className='h-3 bg-muted rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-primary via-festive to-accent transition-all duration-300 ease-out'
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className='text-right text-xs text-muted-foreground'>
            {Math.round(progress)}%
          </p>
        </div>

        <div className='flex justify-center items-center'>
          <div className='w-64 h-64 md:w-80 md:h-80'>
            <Lottie animationData={reindeerAnimation} loop={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
