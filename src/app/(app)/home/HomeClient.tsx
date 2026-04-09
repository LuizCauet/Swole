"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import MacroRing from "@/components/MacroRing";
import LogSheet from "@/components/LogSheet";
import { logMacros } from "@/app/actions";
import { triggerHaptic } from "@/lib/haptics";
import { useRouter } from "next/navigation";

interface Profile {
  calories_goal: number | null;
  protein_goal: number | null;
  carb_goal: number | null;
  fat_goal: number | null;
}

interface Log {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MACRO_CONFIG = [
  {
    key: "calories",
    goalKey: "calories_goal",
    label: "Calories",
    unit: "kcal",
    color: "var(--accent-calories)",
  },
  {
    key: "protein",
    goalKey: "protein_goal",
    label: "Protein",
    unit: "g",
    color: "var(--accent-protein)",
  },
  {
    key: "carbs",
    goalKey: "carb_goal",
    label: "Carbs",
    unit: "g",
    color: "var(--accent-carbs)",
  },
  {
    key: "fat",
    goalKey: "fat_goal",
    label: "Fat",
    unit: "g",
    color: "var(--accent-fat)",
  },
] as const;

interface HomeClientProps {
  profile: Profile;
  log: Log;
  trackingDate: string;
}

export default function HomeClient({
  profile,
  log,
  trackingDate,
}: HomeClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const enabledMacros = MACRO_CONFIG.filter(
    (m) => profile[m.goalKey as keyof Profile] !== null
  );

  const logFields = enabledMacros.map((m) => ({
    key: m.key,
    label: m.label,
    color: m.color,
    unit: m.unit,
  }));

  async function handleLog(values: Record<string, number>) {
    await logMacros({
      ...values,
      trackingDate,
    } as { calories?: number; protein?: number; carbs?: number; fat?: number; trackingDate: string });

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center px-6 pt-12">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-1 text-2xl font-bold"
      >
        Today
      </motion.h1>
      <p className="mb-8 text-xs text-muted">{formatDate(trackingDate)}</p>

      <div
        className={`grid gap-6 ${
          enabledMacros.length <= 2 ? "grid-cols-1" : "grid-cols-2"
        } mb-10`}
      >
        {enabledMacros.map((macro, i) => (
          <motion.div
            key={macro.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <MacroRing
              label={macro.label}
              current={log[macro.key as keyof Log]}
              goal={profile[macro.goalKey as keyof Profile] as number}
              unit={macro.unit}
              color={macro.color}
            />
          </motion.div>
        ))}
      </div>

      {enabledMacros.length === 0 && (
        <p className="text-sm text-muted text-center">
          No macro goals set. Go to Account to set your goals.
        </p>
      )}

      {enabledMacros.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerHaptic("light");
            setSheetOpen(true);
          }}
          className="h-14 w-full max-w-xs rounded-2xl bg-protein font-semibold text-white text-lg shadow-lg shadow-protein/20"
        >
          + Log
        </motion.button>
      )}

      <LogSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        fields={logFields}
        onSubmit={handleLog}
      />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
