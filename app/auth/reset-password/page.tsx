"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      } else {
        router.push("/login");
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseÃ±as no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseÃ±a debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("No se pudo actualizar la contraseÃ±a. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => router.push("/login"), 3000);
  };

  if (!validSession) {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="font-cinzel text-gold text-[0.85rem] tracking-[0.1em]">
          Verificando sesiÃ³n...
        </p>
      </main>
    );
  }

  const passwordStrength = password.length < 6 ? 0 : password.length < 10 ? 1 : 2;
  const strengthColor = passwordStrength === 0 ? "bg-blood-ui" : passwordStrength === 1 ? "bg-gold-dim" : "bg-gold";
  const strengthText = passwordStrength === 0 ? "ContraseÃ±a dÃ©bil" : passwordStrength === 1 ? "ContraseÃ±a regular" : "ContraseÃ±a fuerte";

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center px-8 py-8 relative overflow-hidden">
      {/* Glow fondo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-6 dark:opacity-10 animate-fadeIn"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, var(--raw-gold) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[420px] bg-surface/60 border border-gold/20 px-12 py-12 relative z-10 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="font-cinzel-dec text-[1.5rem] text-gold no-underline block mb-2 hover:opacity-75 transition-opacity">
            TavernLedger
          </Link>
          <Link href="/" className="hidden md:inline-block font-cinzel text-[0.7rem] tracking-[0.1em] text-prose-muted uppercase no-underline hover:text-gold transition-colors mt-1">
            â† Volver al inicio
          </Link>
          <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-prose-muted mt-2">
            Nueva contraseÃ±a
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
            <div className="font-cinzel-dec text-[2rem] text-gold mb-4">âœ¦</div>
            <h2 className="font-cinzel-dec text-[1.1rem] text-gold mb-4">
              Â¡ContraseÃ±a actualizada!
            </h2>
            <p className="text-[0.95rem] italic text-prose-soft leading-relaxed mb-8">
              Tu acceso ha sido restaurado. SerÃ¡s redirigido al login en unos segundos...
            </p>
            <Link href="/login" className="inline-block font-cinzel text-[0.8rem] tracking-[0.15em] uppercase text-canvas bg-gold px-8 py-3 no-underline hover:bg-gold-subtle transition-colors">
              Ir al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <p className="text-[0.9rem] italic text-prose-soft leading-relaxed mb-6">
              Elige una contraseÃ±a segura para proteger tu cuenta.
            </p>

            {/* Nueva contraseÃ±a */}
            <div className="mb-6">
              <label htmlFor="password" className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
                Nueva ContraseÃ±a
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
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className={`w-full px-4 py-3 pr-11 bg-canvas/80 border rounded transition-all duration-200 font-crimson text-base text-prose placeholder-prose-muted outline-none ${
                    focusedField === "password"
                      ? "border-gold/60 shadow-[0_0_0_2px_rgba(201,168,76,0.08)]"
                      : "border-gold/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseÃ±a" : "Mostrar contraseÃ±a"}
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

            {/* Confirmar contraseÃ±a */}
            <div className="mb-6">
              <label htmlFor="confirm" className="block font-cinzel text-[0.7rem] tracking-[0.15em] uppercase text-gold mb-2">
                Confirmar ContraseÃ±a
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className={`w-full px-4 py-3 pr-11 bg-canvas/80 border rounded transition-all duration-200 font-crimson text-base text-prose placeholder-prose-muted outline-none ${
                    focusedField === "confirm"
                      ? "border-gold/60 shadow-[0_0_0_2px_rgba(201,168,76,0.08)]"
                      : "border-gold/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Ocultar contraseÃ±a" : "Mostrar contraseÃ±a"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-prose-muted hover:text-gold transition-colors p-1"
                >
                  {showConfirm ? (
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

            {/* Indicador de fortaleza */}
            {password.length > 0 && (
              <div className="mb-6">
                <div className="h-1 rounded-sm bg-gold/10 overflow-hidden">
                  <div
                    className={`h-full rounded-sm transition-all duration-300 ${strengthColor}`}
                    style={{
                      width: passwordStrength === 0 ? "25%" : passwordStrength === 1 ? "60%" : "100%",
                    }}
                  />
                </div>
                <p className={`text-[0.7rem] italic mt-2 ${
                  passwordStrength === 0 ? "text-blood-ui" : passwordStrength === 1 ? "text-gold-dim" : "text-gold"
                }`}>
                  {strengthText}
                </p>
              </div>
            )}

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
              {loading ? "Actualizando..." : "Actualizar ContraseÃ±a"}
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
            â† Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}
