import Link from "next/link";

export default function CtaSection() {
  return (
    <>
      {/* CTA */}
      <section style={{
        padding: "10rem 4rem",
        textAlign: "center",
        background: "var(--stone)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 4,
          background: "linear-gradient(to right, transparent, var(--gold-dark), var(--gold), var(--gold-dark), transparent)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)",
        }} />

        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(2rem, 5vw, 4rem)",
          color: "var(--gold)", marginBottom: "1rem",
          position: "relative", zIndex: 1,
          textShadow: "0 0 60px rgba(201,168,76,0.2)",
        }}>
          ¿Listo para escribir tu leyenda?
        </h2>

        <p style={{
          fontSize: "1.2rem", fontStyle: "italic",
          color: "var(--parchment-deeper)", marginBottom: "3rem",
          position: "relative", zIndex: 1,
        }}>
          La taberna está abierta. Tu aventura espera en el Ledger.
        </p>

        <div style={{
          display: "flex", gap: "1.2rem",
          justifyContent: "center", flexWrap: "wrap",
          position: "relative", zIndex: 1,
        }}>
          <Link href="/dashboard" style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.85rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--ink)",
            background: "var(--gold)", padding: "1rem 2.5rem",
            textDecoration: "none", display: "inline-block",
          }}>
            Comenzar Gratis
          </Link>
          <Link href="#" style={{
            fontFamily: "var(--font-cinzel), serif",
            fontSize: "0.85rem", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "var(--gold)",
            background: "transparent",
            border: "1px solid var(--gold-dark)",
            padding: "1rem 2.5rem",
            textDecoration: "none", display: "inline-block",
          }}>
            Ver Demostración
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "var(--ink)",
        borderTop: "1px solid rgba(201,168,76,0.1)",
        padding: "3rem 4rem",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: "1.5rem",
      }}>
        <Link href="/" style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1.1rem", color: "var(--gold)",
          textDecoration: "none",
        }}>
          TavernLedger
        </Link>

        <ul style={{ display: "flex", gap: "2rem", listStyle: "none", flexWrap: "wrap" }}>
          {["Características", "Precios", "Documentación", "Privacidad"].map((item) => (
            <li key={item}>
              <Link href="#" style={{
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.7rem", letterSpacing: "0.12em",
                textTransform: "uppercase", color: "var(--text-muted)",
                textDecoration: "none",
              }}>
                {item}
              </Link>
            </li>
          ))}
        </ul>

        <span style={{
          fontSize: "0.85rem", fontStyle: "italic",
          color: "var(--text-muted)",
        }}>
          Forjado con fuego de dragón · 2026
        </span>
      </footer>
    </>
  );
}