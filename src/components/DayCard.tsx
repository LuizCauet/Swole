"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntakeEventItem, { type IntakeEvent } from "./IntakeEventItem";

interface MacroConfig {
  key: string;
  label: string;
  color: string;
  unit: string;
}

interface DayCardProps {
  date: string;
  displayDate: string;
  macros: Record<string, number>;
  enabledMacros: MacroConfig[];
  events: IntakeEvent[];
  showDescription: boolean;
  onUpdated: () => void;
}

export default function DayCard({
  date,
  displayDate,
  macros,
  enabledMacros,
  events,
  showDescription,
  onUpdated,
}: DayCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div layout className="rounded-2xl border border-card-border bg-card overflow-hidden">
      {/* Summary row — tap to expand */}
      <button
        className="w-full px-4 py-3 flex items-center justify-between text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-sm font-medium">{displayDate}</span>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end">
            {enabledMacros.map((m) => (
              <div key={m.key} className="flex items-center gap-1">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-xs tabular-nums text-muted">
                  {macros[m.key] ?? 0}{m.unit}
                </span>
              </div>
            ))}
          </div>
          <svg
            className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Events list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="events"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-card-border flex flex-col gap-2">
              {events.length > 0 ? (
                events.map((event) => (
                  <IntakeEventItem
                    key={event.id}
                    event={event}
                    trackingDate={date}
                    enabledMacros={enabledMacros}
                    showDescription={showDescription}
                    onUpdated={onUpdated}
                  />
                ))
              ) : (
                <p className="text-xs text-muted text-center py-2">
                  No individual entries recorded
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

