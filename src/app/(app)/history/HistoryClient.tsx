"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion } from "framer-motion";
import DayCard from "@/components/DayCard";
import { type IntakeEvent } from "@/components/IntakeEventItem";

const WeeklyChart = dynamic(() => import("@/components/WeeklyChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[168px] rounded-2xl border border-card-border bg-card animate-pulse" />
  ),
});

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

interface IntakeEventWithDate extends IntakeEvent {
  tracking_date: string;
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
  intakeEvents: IntakeEventWithDate[];
  showIntakeDescription: boolean;
}

export default function HistoryClient({
  profile,
  logs,
  dates,
  today,
  intakeEvents,
  showIntakeDescription,
}: HistoryClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const enabledMacros = MACRO_CONFIG.filter(
    (m) => profile[m.goalKey as keyof Profile] !== null
  );

  const logsByDate = new Map(logs.map((l) => [l.tracking_date, l]));

  // Group intake events by date
  const eventsByDate = new Map<string, IntakeEvent[]>();
  for (const event of intakeEvents) {
    const { tracking_date, ...rest } = event;
    const arr = eventsByDate.get(tracking_date) ?? [];
    arr.push(rest);
    eventsByDate.set(tracking_date, arr);
  }

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

      {/* Weekly Summary */}
      {enabledMacros.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-8 rounded-2xl bg-card p-4 border border-card-border"
        >
          <h2 className="mb-4 text-lg font-semibold text-center">Weekly Summary</h2>
          <div className="flex flex-col gap-3">
            {enabledMacros.map((macro) => {
              const goal = profile[macro.goalKey as keyof Profile] as number;

              // Average from previous days that have logged data (excludes today)
              const prevLoggedDays = dates.filter(
                (d) => d !== today && logsByDate.has(d)
              );
              const prevTotal = prevLoggedDays.reduce((s, d) => {
                const log = logsByDate.get(d)!;
                return s + (log[macro.key as keyof DayLog] as number);
              }, 0);
              const avg = prevLoggedDays.length > 0
                ? Math.round(prevTotal / prevLoggedDays.length)
                : 0;
              const diff = avg - goal;
              const daysLabel =
                prevLoggedDays.length === 0
                  ? "No previous data"
                  : `${prevLoggedDays.length} day${prevLoggedDays.length !== 1 ? "s" : ""} tracked`;

              return (
                <div key={macro.key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: macro.color }}>
                      {macro.label}
                    </span>
                    <span className="text-xs text-muted">
                      Avg:{" "}
                      <span className="font-semibold text-foreground">
                        {avg}{macro.unit === "kcal" ? "" : macro.unit}
                      </span>{" "}
                      / day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">{daysLabel}</span>
                    <span
                      className={`font-semibold ${
                        prevLoggedDays.length === 0
                          ? "text-muted"
                          : diff < 0
                          ? "text-red-400"
                          : diff > 0
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {prevLoggedDays.length === 0
                        ? "—"
                        : diff < 0
                        ? `${Math.abs(diff)} under goal`
                        : diff > 0
                        ? `${diff} over goal`
                        : "On target"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
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
                events={eventsByDate.get(date) ?? []}
                showDescription={showIntakeDescription}
                onUpdated={handleUpdated}
              />
            );
          })}
      </div>
    </div>
  );
}

