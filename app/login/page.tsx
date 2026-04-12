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

  const inputStyle = (field: string) => ({
    width: "100%",
    padding: "0.8rem 1rem",
    boxSizing: "border-box" as const,
    background: "rgba(26,20,16,0.8)",
    border: `1px solid ${focusedField === field ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.2)"}`,
    boxShadow: focusedField === field ? "0 0 0 2px rgba(201,168,76,0.08)" : "none",
    color: "var(--parchment)",
    fontFamily: "var(--font-crimson), serif",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  return (
    <>
      <style>{`
        .login-card {
          padding: 3rem;
        }
        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(26,20,16,0.3);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 0.5rem;
        }
        .eye-btn {
          background: none; border: none; cursor: pointer;
          position: absolute; right: 0.8rem; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          padding: 0.2rem;
          transition: color 0.2s;
        }
        .eye-btn:hover { color: var(--gold); }
        .nav-logo {
          transition: opacity 0.2s;
          cursor: pointer;
        }
        .nav-logo:hover { opacity: 0.75; }
        .back-mobile {
          display: none;
          font-family: var(--font-cinzel), serif;
          font-size: 0.7rem; letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          margin-top: 0.6rem;
        }
        @media (max-width: 768px) {
          .back-mobile { display: inline-block; }
        }
        .back-mobile:hover { color: var(--gold); }
        .forgot-link {
          color: var(--text-muted);
          font-size: 0.75rem;
          font-style: italic;
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: var(--gold); }
        .submit-btn {
          width: 100%; padding: 1rem;
          border: none;
          font-family: var(--font-cinzel), serif;
          font-size: 0.85rem; letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s, transform 0.1s;
        }
        .submit-btn:not(:disabled):hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .submit-btn:not(:disabled):active {
          transform: translateY(0);
        }
        .oauth-btn {
          width: 100%; padding: 0.75rem 1rem;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(26,20,16,0.6);
          color: var(--parchment);
          font-family: var(--font-cinzel), serif;
          font-size: 0.78rem; letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.1s;
        }
        .oauth-btn:hover {
          border-color: rgba(201,168,76,0.55);
          background: rgba(201,168,76,0.07);
          transform: translateY(-1px);
        }
        .oauth-btn:active { transform: translateY(0); }
        .oauth-divider {
          display: flex; align-items: center; gap: 0.75rem;
          margin: 1.5rem 0;
          color: var(--text-muted);
          font-family: var(--font-cinzel), serif;
          font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
        }
        .oauth-divider::before, .oauth-divider::after {
          content: ""; flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent);
        }
      `}</style>

      <main style={{
        minHeight: "100vh",
        background: "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }} />

        <div className="login-card" style={{
          width: "100%", maxWidth: 420,
          background: "rgba(58,50,40,0.6)",
          border: "1px solid rgba(201,168,76,0.2)",
          position: "relative", zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Link href="/" className="nav-logo" style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.5rem", color: "var(--gold)",
              textDecoration: "none", display: "block",
              marginBottom: "0.5rem",
            }}>
              TavernLedger
            </Link>
            <Link href="/" className="back-mobile">← Volver al inicio</Link>
            <p style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.7rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "var(--text-muted)",
            }}>
              Entra a la taberna
            </p>
          </div>

          <div style={{
            height: 1, marginBottom: "2.5rem",
            background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)",
          }} />

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="email" style={{
                display: "block",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.7rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--gold)",
                marginBottom: "0.5rem",
              }}>
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
                style={inputStyle("email")}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: "0.5rem" }}>
              <label htmlFor="password" style={{
                display: "block",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.7rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--gold)",
                marginBottom: "0.5rem",
              }}>
                Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle("password"), paddingRight: "2.8rem" }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
            <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
              <Link href="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p style={{
                fontSize: "0.85rem", color: "var(--blood-light)",
                marginBottom: "1rem", fontStyle: "italic",
              }}>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                background: loading ? "var(--gold-dark)" : "var(--gold)",
                color: "var(--ink)",
              }}
            >
              {loading && <span className="spinner" />}
              {loading ? "Entrando..." : "Entrar a la Taberna"}
            </button>
          </form>

          <div className="oauth-divider">o continúa con</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {/* Google */}
            <button className="oauth-btn" onClick={() => handleOAuth("google")} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            {/* Discord */}
            <button className="oauth-btn" onClick={() => handleOAuth("discord")} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discord
            </button>
          </div>

          <div style={{ height: 1, margin: "2rem 0", background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)" }} />

          <p style={{
            textAlign: "center", fontSize: "0.9rem",
            fontStyle: "italic", color: "var(--text-muted)",
          }}>
            ¿Primera vez en la taberna?{" "}
            <Link href="/register" style={{ color: "var(--gold)", textDecoration: "none" }}>
              Crea tu cuenta
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
