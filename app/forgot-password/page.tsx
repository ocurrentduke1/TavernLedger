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
    <>
      <style>{`
        .fp-card { padding: 3rem; }
        @media (max-width: 480px) {
          .fp-card { padding: 2rem 1.5rem; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
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
        .submit-btn {
          width: 100%; padding: 1rem; border: none;
          font-family: var(--font-cinzel), serif;
          font-size: 0.85rem; letter-spacing: 0.15em;
          text-transform: uppercase; cursor: pointer;
          transition: background 0.2s, opacity 0.2s, transform 0.1s;
        }
        .submit-btn:not(:disabled):hover { opacity: 0.88; transform: translateY(-1px); }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
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

        <div className="fp-card" style={{
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
              Recupera tu acceso
            </p>
          </div>

          <div style={{ height: 1, marginBottom: "2.5rem", background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)" }} />

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "2rem", color: "var(--gold)", marginBottom: "1rem" }}>
                ✦
              </div>
              <p style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--parchment-deeper)", lineHeight: 1.7, marginBottom: "2rem" }}>
                Si ese correo existe en la taberna, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link href="/login" style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.8rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "var(--ink)",
                background: "var(--gold)", padding: "0.8rem 2rem",
                textDecoration: "none", display: "inline-block",
              }}>
                Volver al Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{
                fontSize: "0.9rem", fontStyle: "italic",
                color: "var(--parchment-deeper)", lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

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
                  style={{
                    width: "100%", padding: "0.8rem 1rem",
                    boxSizing: "border-box",
                    background: "rgba(26,20,16,0.8)",
                    border: `1px solid ${focusedField === "email" ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.2)"}`,
                    boxShadow: focusedField === "email" ? "0 0 0 2px rgba(201,168,76,0.08)" : "none",
                    color: "var(--parchment)",
                    fontFamily: "var(--font-crimson), serif",
                    fontSize: "1rem", outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: "0.85rem", color: "var(--blood-light)", marginBottom: "1rem", fontStyle: "italic" }}>
                  {error}
                </p>
              )}

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
                {loading ? "Enviando..." : "Enviar enlace"}
              </button>
            </form>
          )}

          <div style={{ height: 1, margin: "2rem 0", background: "linear-gradient(to right, transparent, var(--gold-dark), transparent)" }} />

          <p style={{ textAlign: "center", fontSize: "0.9rem", fontStyle: "italic", color: "var(--text-muted)" }}>
            <Link href="/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
              ← Volver al login
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
