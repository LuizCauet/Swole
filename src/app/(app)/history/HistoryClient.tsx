"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import WeeklyChart from "@/components/WeeklyChart";
import DayCard from "@/components/DayCard";

interface Profile {
  calories_goal: number | null;
  protein_goal: number | null;
  carb_goal: number | null;
  fat_goal: number | null;
}

interface DayLog {
  tracking_date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MACRO_CONFIG = [
  { key: "calories", goalKey: "calories_goal", label: "Calories", unit: "kcal", color: "var(--accent-calories)" },
  { key: "protein", goalKey: "protein_goal", label: "Protein", unit: "g", color: "var(--accent-protein)" },
  { key: "carbs", goalKey: "carb_goal", label: "Carbs", unit: "g", color: "var(--accent-carbs)" },
  { key: "fat", goalKey: "fat_goal", label: "Fat", unit: "g", color: "var(--accent-fat)" },
] as const;

interface HistoryClientProps {
  profile: Profile;
  logs: DayLog[];
  dates: string[];
  today: string;
}

export default function HistoryClient({
  profile,
  logs,
  dates,
  today,
}: HistoryClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const enabledMacros = MACRO_CONFIG.filter(
    (m) => profile[m.goalKey as keyof Profile] !== null
  );

  const logsByDate = new Map(logs.map((l) => [l.tracking_date, l]));

  function handleUpdated() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="px-4 pt-12 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-center"
      >
        This Week
      </motion.h1>

      {/* Charts */}
      <div className="flex flex-col gap-4 mb-8">
        {enabledMacros.map((macro, i) => {
          const chartData = dates.map((d) => {
            const log = logsByDate.get(d);
            const dayLabel = new Date(d + "T12:00:00").toLocaleDateString(
              "en-US",
              { weekday: "short" }
            );
            return {
              day: dayLabel,
              value: log ? log[macro.key as keyof DayLog] as number : 0,
            };
          });

          return (
            <motion.div
              key={macro.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <WeeklyChart
                data={chartData}
                color={macro.color}
                label={macro.label}
                goal={profile[macro.goalKey as keyof Profile] as number}
                unit={macro.unit}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Day cards (past days only, newest first) */}
      <h2 className="mb-3 text-sm font-medium text-muted">Previous Days</h2>
      <div className="flex flex-col gap-3">
        {dates
          .filter((d) => d !== today)
          .reverse()
          .map((date) => {
            const log = logsByDate.get(date);
            const macros: Record<string, number> = {
              calories: log?.calories ?? 0,
              protein: log?.protein ?? 0,
              carbs: log?.carbs ?? 0,
              fat: log?.fat ?? 0,
            };

            const displayDate = new Date(
              date + "T12:00:00"
            ).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

            return (
              <DayCard
                key={date}
                date={date}
                displayDate={displayDate}
                macros={macros}
                enabledMacros={enabledMacros.map((m) => ({
                  key: m.key,
                  label: m.label,
                  color: m.color,
                  unit: m.unit,
                }))}
                onUpdated={handleUpdated}
              />
            );
          })}
      </div>
    </div>
  );
}
