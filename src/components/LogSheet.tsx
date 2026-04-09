"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/lib/haptics";

interface MacroField {
  key: string;
  label: string;
  color: string;
  unit: string;
}

interface LogSheetProps {
  open: boolean;
  onClose: () => void;
  fields: MacroField[];
  onSubmit: (values: Record<string, number>) => Promise<void>;
}

export default function LogSheet({
  open,
  onClose,
  fields,
  onSubmit,
}: LogSheetProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    const numericValues: Record<string, number> = {};
    for (const field of fields) {
      const v = parseInt(values[field.key] || "0");
      if (v > 0) numericValues[field.key] = v;
    }
    await onSubmit(numericValues);
    triggerHaptic("success");
    setValues({});
    setLoading(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-card-border px-6 pb-10 pt-4"
          >
            {/* Handle */}
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-card-border" />

            <h2 className="mb-5 text-lg font-semibold text-center">
              Log Macros
            </h2>

            <div className="flex flex-col gap-4">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: field.color }}
                  />
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={field.label}
                      min={0}
                      value={values[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="h-12 w-full rounded-xl border border-card-border bg-background px-4 pr-12 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-protein/50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted">
                      {field.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 h-12 w-full rounded-xl bg-protein font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "Logging..." : "Log"}
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
