"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError("Error al crear la cuenta. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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

  const EyeIcon = ({ visible }: { visible: boolean }) => visible ? (
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
  );

  if (success) {
    return (
      <main style={{
        minHeight: "100vh", background: "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem",
      }}>
        <div style={{
          maxWidth: 420, width: "100%",
          background: "rgba(58,50,40,0.6)",
          border: "1px solid rgba(201,168,76,0.2)",
          padding: "3rem", textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "2rem", color: "var(--gold)", marginBottom: "1rem",
          }}>✦</div>
          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "1.3rem", color: "var(--gold)", marginBottom: "1rem",
          }}>
            ¡Bienvenido, Aventurero!
          </h2>
          <p style={{
            fontSize: "1rem", fontStyle: "italic",
            color: "var(--parchment-deeper)", lineHeight: 1.7,
          }}>
            Revisa tu correo y confirma tu cuenta para entrar a la taberna.
          </p>
          <Link href="/login" style={{
            display: "inline-block", marginTop: "2rem",
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.8rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--ink)",
            background: "var(--gold)", padding: "0.8rem 2rem",
            textDecoration: "none",
          }}>
            Ir al Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <style>{`
        .register-card {
          padding: 3rem;
        }
        @media (max-width: 480px) {
          .register-card {
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
      `}</style>

      <main style={{
        minHeight: "100vh", background: "var(--ink)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }} />

        <div className="register-card" style={{
          width: "100%", maxWidth: 420,
          background: "rgba(58,50,40,0.6)",
          border: "1px solid rgba(201,168,76,0.2)",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Link href="/" className="nav-logo" style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.5rem", color: "var(--gold)",
              textDecoration: "none", display: "block", marginBottom: "0.5rem",
            }}>
              TavernLedger
            </Link>
            <Link href="/" className="back-mobile">← Volver al inicio</Link>
            <p style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.7rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "var(--text-muted)",
              marginTop: "0.4rem",
            }}>
              Forja tu identidad
            </p>
          </div>

          <div style={{ height: 1, marginBottom: "2.5rem", background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)" }} />

          <form onSubmit={handleRegister}>
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
            <div style={{ marginBottom: "1.5rem" }}>
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
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="confirm" style={{
                display: "block",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.7rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--gold)",
                marginBottom: "0.5rem",
              }}>
                Confirmar Contraseña
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputStyle("confirm"), paddingRight: "2.8rem" }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
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
              {loading ? "Creando cuenta..." : "Unirse a la Taberna"}
            </button>
          </form>

          <div style={{ height: 1, margin: "2rem 0", background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)" }} />

          <p style={{
            textAlign: "center", fontSize: "0.9rem",
            fontStyle: "italic", color: "var(--text-muted)",
          }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
              Entra a la taberna
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
