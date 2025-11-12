"use client"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"

type Question3Props = {
  onAnswer: (answer: string) => void
}

export function Question3({ onAnswer }: Question3Props) {
  const options = [
    {
      value: "physical",
      label: "Physical Activity & Movement",
      description: "Staying active keeps me energized",
    },
    {
      value: "musical",
      label: "Music & Melodies",
      description: "Songs uplift my spirit",
    },
    {
      value: "culinary",
      label: "Culinary Adventures",
      description: "Cooking brings me joy",
    },
    {
      value: "words",
      label: "Inspiring Words & Wisdom",
      description: "Quotes and thoughts guide me",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-700">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-primary rounded-full" />
          <div className="flex-1 h-1.5 bg-primary rounded-full" />
          <div className="flex-1 h-1.5 bg-primary rounded-full" />
          <div className="flex-1 h-1.5 bg-muted rounded-full" />
          <div className="flex-1 h-1.5 bg-muted rounded-full" />
          <div className="flex-1 h-1.5 bg-muted rounded-full" />
          <div className="flex-1 h-1.5 bg-muted rounded-full" />
          <div className="flex-1 h-1.5 bg-muted rounded-full" />
        </div>

        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-7xl text-primary"
          >
            Daily Motivation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-foreground text-balance"
          >
            What motivates you most throughout the day?
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {options.map((option) => (
            <Card
              key={option.value}
              className="p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card"
              onClick={() => onAnswer(option.value)}
            >
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-muted group-hover:border-primary transition-colors flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-foreground mb-1">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">3 of 8</p>
      </div>
    </div>
  )
}
