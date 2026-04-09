"use client";

import { useState } from "react";
import { login } from "@/app/actions";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
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
        <h1 className="mb-2 text-center text-4xl font-bold tracking-tight">
          Swole
        </h1>
        <p className="mb-8 text-center text-muted text-sm">
          Track your macros, crush your goals.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            className="h-12 rounded-xl border border-card-border bg-card px-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-protein/50"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            className="h-12 rounded-xl border border-card-border bg-card px-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-protein/50"
          />

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
            className="h-12 rounded-xl bg-protein font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-protein font-medium">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
