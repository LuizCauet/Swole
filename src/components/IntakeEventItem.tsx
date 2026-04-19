"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateIntakeEvent, deleteIntakeEvent } from "@/app/actions";

interface MacroConfig {
  key: string;
  label: string;
  color: string;
  unit: string;
}

export interface IntakeEvent {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string | null;
  created_at: string;
}

interface IntakeEventItemProps {
  event: IntakeEvent;
  trackingDate: string;
  enabledMacros: MacroConfig[];
  showDescription: boolean;
  onUpdated: () => void;
}

export default function IntakeEventItem({
  event,
  trackingDate,
  enabledMacros,
  showDescription,
  onUpdated,
}: IntakeEventItemProps) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [description, setDescription] = useState(event.description ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const time = new Date(event.created_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  function startEdit() {
    const initial: Record<string, string> = {};
    enabledMacros.forEach((m) => {
      initial[m.key] = String(event[m.key as keyof IntakeEvent] ?? 0);
    });
    setValues(initial);
    setDescription(event.description ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    await updateIntakeEvent({
      id: event.id,
      trackingDate,
      calories: parseInt(values.calories || "0"),
      protein: parseInt(values.protein || "0"),
      carbs: parseInt(values.carbs || "0"),
      fat: parseInt(values.fat || "0"),
      description: description.trim() || undefined,
    });
    setSaving(false);
    setEditing(false);
    onUpdated();
  }

  async function handleDelete() {
    setDeleting(true);
    await deleteIntakeEvent(event.id, trackingDate);
    setDeleting(false);
    onUpdated();
  }

  return (
    <motion.div layout className="rounded-xl border border-card-border bg-background p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted">{time}</span>
        <div className="flex items-center gap-3">
          {editing && (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="text-xs text-red-400 font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-muted font-medium"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={editing ? handleSave : startEdit}
            disabled={saving || deleting}
            className="text-xs text-protein font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save" : "Edit"}
          </button>
        </div>
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
                  className="h-8 flex-1 rounded-lg border border-card-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-protein/50"
                />
                <span className="text-[10px] text-muted w-6">{m.unit}</span>
              </div>
            ))}
            {showDescription && (
              <input
                type="text"
                placeholder="Note (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-8 w-full rounded-lg border border-card-border bg-card px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-protein/50"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {enabledMacros.map((m) => (
                <div key={m.key} className="flex items-center gap-1">
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-xs font-medium tabular-nums">
                    {event[m.key as keyof IntakeEvent]}{m.unit}
                  </span>
                </div>
              ))}
            </div>
            {event.description && (
              <p className="mt-1 text-xs text-muted italic">{event.description}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
