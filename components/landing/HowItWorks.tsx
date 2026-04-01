const steps = [
  {
    num: "I",
    title: "Crea tu campaña",
    desc: "El Dungeon Master abre una sala y comparte el enlace con el grupo.",
  },
  {
    num: "II",
    title: "Forja tu personaje",
    desc: "Cada jugador crea su héroe con la guía de la IA o manualmente.",
  },
  {
    num: "III",
    title: "Entra en partida",
    desc: "Rastrea HP, lanza dados y mueve tokens en el mapa en tiempo real.",
  },
  {
    num: "IV",
    title: "Exporta tu leyenda",
    desc: "Descarga tu ficha en PDF oficial o comparte el resumen de la sesión.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" style={{
      padding: "8rem 4rem",
      background: "var(--stone)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: "linear-gradient(to right, transparent, var(--gold-dark), var(--gold), var(--gold-dark), transparent)",
      }} />

      <p style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.7rem", letterSpacing: "0.4em",
        textTransform: "uppercase", color: "var(--gold)",
        textAlign: "center", marginBottom: "1rem",
      }}>
        El Camino del Héroe
      </p>

      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "clamp(1.8rem, 4vw, 3rem)",
        textAlign: "center", color: "var(--parchment)",
        marginBottom: "1rem", lineHeight: 1.2,
      }}>
        Cómo funciona
      </h2>

      <p style={{
        textAlign: "center", fontSize: "1.15rem",
        fontStyle: "italic", color: "var(--parchment-deeper)",
        maxWidth: 500, margin: "0 auto 5rem", lineHeight: 1.7,
      }}>
        En cuatro pasos, tu grupo estará listo para la aventura.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 0, maxWidth: 1000, margin: "0 auto",
        position: "relative",
      }}>
        {/* Línea conectora */}
        <div style={{
          position: "absolute",
          top: 36, left: "12%", right: "12%", height: 1,
          background: "linear-gradient(to right, transparent, var(--gold-dark), var(--gold-dark), transparent)",
        }} />

        {steps.map((s) => (
          <div key={s.num} style={{
            padding: "0 2rem", textAlign: "center",
            position: "relative",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--ink)",
              border: "2px solid var(--gold-dark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.4rem", color: "var(--gold)",
              position: "relative", zIndex: 1,
            }}>
              {s.num}
            </div>
            <h3 style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.9rem", letterSpacing: "0.05em",
              color: "var(--gold-light)", marginBottom: "0.6rem",
            }}>
              {s.title}
            </h3>
            <p style={{
              fontSize: "0.95rem", fontStyle: "italic",
              color: "var(--parchment-deeper)", lineHeight: 1.6,
            }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}