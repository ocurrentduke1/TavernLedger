"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "discord") => {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-8 py-8 relative overflow-hidden">
      {/* Glow fondo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-6 dark:opacity-10"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, var(--raw-gold) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[420px] bg-surface/60 border border-gold/20 px-12 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="font-cinzel-dec text-[1.5rem] text-gold no-underline block mb-2 hover:opacity-75 transition-opacity">
            TavernLedger
          </Link>
          <Link href="/" className="hidden md:inline-block font-cinzel text-[0.7rem] tracking-[0.1em] text-prose-muted uppercase no-underline hover:text-gold transition-colors mt-1">
            ← Volver al inicio
          </Link>
          <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-prose-muted mt-2">
            Entra a la taberna
          </p>
        </div>

        <div
          className="h-px mb-10"
          style={{
            background: "linear-gradient(to right, transparent, var(--raw-gold-dim), transparent)",
          }}
        />

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              Correo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              placeholder="tu@correo.com"
              className={`w-full px-4 py-3 bg-canvas/80 border rounded transition-all duration-200 font-crimson text-base text-prose placeholder-prose-muted outline-none ${
                focusedField === "email"
                  ? "border-gold/60 shadow-[0_0_0_2px_rgba(201,168,76,0.08)]"
                  : "border-gold/20"
              }`}
            />
          </div>

          {/* Contraseña */}
          <div className="mb-2">
            <label htmlFor="password" className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-3 pr-11 bg-canvas/80 border rounded transition-all duration-200 font-crimson text-base text-prose placeholder-prose-muted outline-none ${
                  focusedField === "password"
                    ? "border-gold/60 shadow-[0_0_0_2px_rgba(201,168,76,0.08)]"
                    : "border-gold/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-prose-muted hover:text-gold transition-colors p-1"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Olvidé contraseña */}
          <div className="text-right mb-6">
            <Link href="/forgot-password" className="font-crimson text-[0.75rem] italic text-prose-muted hover:text-gold transition-colors no-underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[0.85rem] text-blood-ui mb-4 italic">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-cinzel text-[0.85rem] tracking-[0.15em] uppercase text-canvas bg-gold disabled:bg-gold-subtle hover:bg-gold-subtle transition-colors duration-200 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <span className="inline-block animate-spin mr-2 w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full" />}
            {loading ? "Entrando..." : "Entrar a la Taberna"}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)" }} />
          <span className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase text-prose-muted">o continúa con</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)" }} />
        </div>

        <div className="flex flex-col gap-2">
          {/* Google */}
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            className="w-full py-3 flex items-center justify-center gap-2 border border-gold/25 bg-canvas/60 hover:border-gold/55 hover:bg-gold/7 text-prose font-cinzel text-[0.78rem] tracking-[0.12em] uppercase transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {/* Discord */}
          <button
            type="button"
            onClick={() => handleOAuth("discord")}
            className="w-full py-3 flex items-center justify-center gap-2 border border-gold/25 bg-canvas/60 hover:border-gold/55 hover:bg-gold/7 text-prose font-cinzel text-[0.78rem] tracking-[0.12em] uppercase transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord
          </button>
        </div>

        <div
          className="h-px my-8"
          style={{
            background: "linear-gradient(to right, transparent, var(--raw-gold-dim), transparent)",
          }}
        />

        <p className="text-center text-[0.9rem] italic text-prose-muted">
          ¿Primera vez en la taberna?{" "}
          <Link href="/register" className="text-gold no-underline hover:text-gold-subtle transition-colors">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}

