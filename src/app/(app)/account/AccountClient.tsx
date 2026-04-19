"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { saveGoals, logout, toggleIntakeDescription } from "@/app/actions";
import { useRouter } from "next/navigation";

interface Profile {
  calories_goal: number | null;
  protein_goal: number | null;
  carb_goal: number | null;
  fat_goal: number | null;
}

const macroFields = [
  { name: "calories", goalKey: "calories_goal", label: "Calories", unit: "kcal", color: "bg-calories" },
  { name: "protein", goalKey: "protein_goal", label: "Protein", unit: "g", color: "bg-protein" },
  { name: "carbs", goalKey: "carb_goal", label: "Carbs", unit: "g", color: "bg-carbs" },
  { name: "fat", goalKey: "fat_goal", label: "Fat", unit: "g", color: "bg-fat" },
] as const;

interface AccountClientProps {
  email: string;
  profile: Profile;
  showIntakeDescription: boolean;
}

export default function AccountClient({ email, profile, showIntakeDescription }: AccountClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [descEnabled, setDescEnabled] = useState(showIntakeDescription);
  const [descToggling, setDescToggling] = useState(false);
  const router = useRouter();

  async function handleSaveGoals(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(e.currentTarget);
    const result = await saveGoals(formData, false);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSaved(true);
      setLoading(false);
      router.refresh();
    }
  }

  async function handleToggleDescription(value: boolean) {
    setDescToggling(true);
    setDescEnabled(value);
    await toggleIntakeDescription(value);
    setDescToggling(false);
  }

  return (
    <div className="px-6 pt-12 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-2xl font-bold text-center"
      >
        Account
      </motion.h1>

      <div className="mb-8 rounded-2xl border border-card-border bg-card p-4">
        <p className="text-xs text-muted mb-1">Signed in as</p>
        <p className="text-sm font-medium truncate">{email}</p>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Daily Goals</h2>
      <form onSubmit={handleSaveGoals} className="flex flex-col gap-4">
        {macroFields.map((field) => (
          <div key={field.name} className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${field.color}`} />
            <div className="flex-1 relative">
              <input
                name={field.name}
                type="number"
                placeholder={field.label}
                min={0}
                inputMode="numeric"
                defaultValue={
                  profile[field.goalKey as keyof Profile] ?? ""
                }
                className="h-12 w-full rounded-xl border border-card-border bg-card px-4 pr-12 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-protein/50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">
                {field.unit}
              </span>
            </div>
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
        {saved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-carbs text-center"
          >
            Goals updated!
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.97 }}
          className="h-12 rounded-xl bg-protein font-semibold text-white transition-opacity disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Goals"}
        </motion.button>
      </form>

      {/* Logging settings */}
      <h2 className="mt-8 mb-4 text-lg font-semibold">Logging</h2>
      <div className="rounded-2xl border border-card-border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Entry notes</p>
          <p className="text-xs text-muted mt-0.5">Show a note field when logging</p>
        </div>
        <button
          role="switch"
          aria-checked={descEnabled}
          disabled={descToggling}
          onClick={() => handleToggleDescription(!descEnabled)}
          className={`relative h-6 w-11 rounded-full transition-colors duration-200 disabled:opacity-50 ${
            descEnabled ? "bg-protein" : "bg-card-border"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              descEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <form action={logout} className="mt-8">
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="h-12 w-full rounded-xl border border-card-border bg-card font-medium text-red-400"
        >
          Sign Out
        </motion.button>
      </form>
    </div>
  );
}

