"use client";

import { useState } from "react";
import { saveGoals } from "@/app/actions";
import { motion } from "framer-motion";

const macroFields = [
  { name: "calories", label: "Calories", unit: "kcal", color: "bg-calories" },
  { name: "protein", label: "Protein", unit: "g", color: "bg-protein" },
  { name: "carbs", label: "Carbs", unit: "g", color: "bg-carbs" },
  { name: "fat", label: "Fat", unit: "g", color: "bg-fat" },
] as const;

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await saveGoals(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight">
          Set Your Goals
        </h1>
        <p className="mb-8 text-center text-muted text-sm">
          Leave blank any macro you don&apos;t want to track.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {macroFields.map((field, i) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`h-3 w-3 rounded-full ${field.color}`} />
              <div className="flex-1 relative">
                <input
                  name={field.name}
                  type="number"
                  placeholder={field.label}
                  min={0}
                  inputMode="numeric"
                  className="h-12 w-full rounded-xl border border-card-border bg-card px-4 pr-12 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-protein/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">
                  {field.unit}
                </span>
              </div>
            </motion.div>
          ))}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="mt-4 h-12 rounded-xl bg-protein font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? "Saving..." : "Let's Go"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
