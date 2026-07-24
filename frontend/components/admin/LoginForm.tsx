"use client";

import { useState } from "react";
import { adminApi } from "@/lib/admin-client";

export default function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await adminApi.login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md glass-strong rounded-2xl p-8 border border-white/10"
      >
        <h1 className="text-2xl font-bold mb-2">
          Admin <span className="gradient-text">Sign in</span>
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Manage projects, messages, and site content.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-sm text-zinc-400 mb-2">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm text-zinc-400 mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          {error && (
            <p role="alert" className="text-sm text-center text-red-400">
              {error}
            </p>
          )}
        </div>
      </form>
    </main>
  );
}
