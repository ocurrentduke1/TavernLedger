import Link from "next/link";

export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "8rem 2rem 6rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Fondo con gradientes */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 110%, rgba(201,168,76,0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 80% 20%, rgba(139,26,26,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 40% 50% at 20% 80%, rgba(212,96,26,0.06) 0%, transparent 60%)
        `,
      }} />

      {/* Brillo izquierdo */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        filter: "blur(60px)", pointerEvents: "none",
        width: 300, height: 400, left: -80, top: "30%",
        background: "radial-gradient(circle, rgba(212,96,26,0.15) 0%, transparent 70%)",
        animation: "flicker 4s ease-in-out infinite alternate",
      }} />

      {/* Brillo derecho */}
      <div style={{
        position: "absolute", borderRadius: "50%",
        filter: "blur(60px)", pointerEvents: "none",
        width: 300, height: 400, right: -80, top: "20%",
        background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
        animation: "flicker 5s ease-in-out infinite alternate-reverse",
      }} />

      {/* Contenido */}
      <p style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.7rem", letterSpacing: "0.4em",
        textTransform: "uppercase", color: "var(--gold)",
        marginBottom: "1.5rem", position: "relative", zIndex: 1,
        animation: "fadeUp 0.8s 0.2s both",
      }}>
        — El libro de los aventureros —
      </p>

      <h1 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "clamp(3.5rem, 9vw, 8rem)",
        lineHeight: 0.95, color: "var(--gold)",
        position: "relative", zIndex: 1,
        textShadow: "0 0 80px rgba(201,168,76,0.3), 0 4px 20px rgba(0,0,0,0.8)",
        animation: "fadeUp 0.9s 0.4s both",
      }}>
        TavernLedger
        <span style={{
          display: "block",
          fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
          color: "var(--parchment-dark)",
          fontFamily: "var(--font-cinzel), serif",
          fontWeight: 400, letterSpacing: "0.3em",
          marginTop: "0.3em",
          textShadow: "none",
        }}>
          Chronicles &amp; Characters
        </span>
      </h1>

      {/* Divisor */}
      <div style={{
        width: 320, height: 1, margin: "2.5rem auto",
        position: "relative", zIndex: 1,
        background: "linear-gradient(to right, transparent, var(--gold-dark), var(--gold), var(--gold-dark), transparent)",
        animation: "fadeUp 0.8s 0.7s both",
      }} />

      <p style={{
        fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
        fontStyle: "italic", color: "var(--parchment-dark)",
        maxWidth: 560, lineHeight: 1.7,
        position: "relative", zIndex: 1,
        animation: "fadeUp 0.8s 0.9s both",
      }}>
        Gestiona tus héroes, rastrea batallas, lanza dados y narra leyendas.
        Todo en un grimorio digital para tu grupo de D&amp;D.
      </p>

      <div style={{
        display: "flex", gap: "1.2rem", marginTop: "3rem",
        position: "relative", zIndex: 1,
        animation: "fadeUp 0.8s 1.1s both",
        flexWrap: "wrap", justifyContent: "center",
      }}>
        <Link href="/dashboard" style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.85rem", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--ink)",
          background: "var(--gold)", border: "none",
          padding: "1rem 2.5rem", textDecoration: "none",
          display: "inline-block",
        }}>
          Comenzar Aventura
        </Link>
        <a href="#features" style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.85rem", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "var(--gold)",
          background: "transparent",
          border: "1px solid var(--gold-dark)",
          padding: "1rem 2.5rem", textDecoration: "none",
          display: "inline-block",
        }}>
          Ver el Grimorio
        </a>
      </div>
    </section>
  );
}