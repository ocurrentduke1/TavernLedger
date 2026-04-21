"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError("No se pudo enviar el correo. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
            Recupera tu acceso
          </p>
        </div>

        <div
          className="h-px mb-10"
          style={{
            background: "linear-gradient(to right, transparent, var(--raw-gold-dim), transparent)",
          }}
        />

        {success ? (
          <div className="text-center">
            <div className="font-cinzel-dec text-[2rem] text-gold mb-4">✦</div>
            <p className="text-base italic text-prose-soft leading-relaxed mb-8">
              Si ese correo existe en la taberna, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="inline-block font-cinzel text-[0.8rem] tracking-[0.15em] uppercase text-canvas bg-gold px-8 py-3 no-underline hover:bg-gold-subtle transition-colors">
              Volver al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-[0.9rem] italic text-prose-soft leading-relaxed mb-6">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

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

            {error && (
              <p className="text-[0.85rem] text-blood-ui mb-4 italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 font-cinzel text-[0.85rem] tracking-[0.15em] uppercase text-canvas bg-gold disabled:bg-gold-subtle hover:bg-gold-subtle transition-colors duration-200 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <span className="inline-block animate-spin mr-2 w-4 h-4 border-2 border-canvas/30 border-t-canvas rounded-full" />}
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}

        <div
          className="h-px my-8"
          style={{
            background: "linear-gradient(to right, transparent, var(--raw-gold-dim), transparent)",
          }}
        />

        <p className="text-center text-[0.9rem] italic text-prose-muted">
          <Link href="/login" className="text-gold no-underline hover:text-gold-subtle transition-colors">
            ← Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}