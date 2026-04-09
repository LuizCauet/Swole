"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateDayLog } from "@/app/actions";

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
  onUpdated: () => void;
}

export default function DayCard({
  date,
  displayDate,
  macros,
  enabledMacros,
  onUpdated,
}: DayCardProps) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function startEdit() {
    const initial: Record<string, string> = {};
    enabledMacros.forEach((m) => {
      initial[m.key] = String(macros[m.key] ?? 0);
    });
    setValues(initial);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    await updateDayLog({
      trackingDate: date,
      calories: parseInt(values.calories || "0"),
      protein: parseInt(values.protein || "0"),
      carbs: parseInt(values.carbs || "0"),
      fat: parseInt(values.fat || "0"),
    });
    setSaving(false);
    setEditing(false);
    onUpdated();
  }

  return (
    <motion.div
      layout
      className="rounded-2xl border border-card-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{displayDate}</span>
        <button
          onClick={editing ? handleSave : startEdit}
          disabled={saving}
          className="text-xs text-protein font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : editing ? "Save" : "Edit"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {enabledMacros.map((m) => (
              <div key={m.key} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-xs text-muted w-16">{m.label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={values[m.key] || ""}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [m.key]: e.target.value }))
                  }
                  className="h-8 flex-1 rounded-lg border border-card-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-protein/50"
                />
                <span className="text-[10px] text-muted w-6">{m.unit}</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            {enabledMacros.map((m) => (
              <div key={m.key} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-xs text-muted">{m.label}</span>
                <span className="text-xs font-medium tabular-nums">
                  {macros[m.key] ?? 0}
                  {m.unit}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
