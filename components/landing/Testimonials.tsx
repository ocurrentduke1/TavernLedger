const testimonials = [
  {
    text: "Finalmente una herramienta que entiende lo que necesita un DM. Gestionar cinco personajes en tiempo real sin perder el hilo de la historia es un sueño.",
    initials: "MR",
    name: "Marcos Ruiz",
    role: "Dungeon Master · 8 años de campaña",
  },
  {
    text: "La IA generó un trasfondo para mi Warlock que me dejó sin palabras. Conexiones con el grupo, secretos, motivaciones… todo en segundos.",
    initials: "SL",
    name: "Sofía Landa",
    role: "Jugadora · Especialista en roleplay",
  },
  {
    text: "El simulador de dados con historial cambió completamente cómo jugamos. Nunca más discusiones sobre si alguien hizo trampa en la tirada.",
    initials: "CB",
    name: "Carlos Bernal",
    role: "Jugador · Paladín principal",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{
      padding: "8rem 4rem",
      background: "var(--ink)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: "linear-gradient(to right, transparent, var(--blood), transparent)",
      }} />

      <p style={{
        fontFamily: "var(--font-cinzel), serif",
        fontSize: "0.7rem", letterSpacing: "0.4em",
        textTransform: "uppercase", color: "var(--gold)",
        textAlign: "center", marginBottom: "1rem",
      }}>
        Voces de la Taberna
      </p>

      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "clamp(1.8rem, 4vw, 3rem)",
        textAlign: "center", color: "var(--parchment)",
        marginBottom: "1rem", lineHeight: 1.2,
      }}>
        Aventureros que confían en el Ledger
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem", maxWidth: 1000,
        margin: "4rem auto 0",
      }}>
        {testimonials.map((t) => (
          <div key={t.name} style={{
            background: "rgba(58,50,40,0.4)",
            border: "1px solid rgba(201,168,76,0.12)",
            padding: "2rem", position: "relative",
          }}>
            {/* Comilla decorativa */}
            <div style={{
              position: "absolute", top: "-0.2rem", left: "1.2rem",
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "5rem", color: "var(--gold-dark)",
              opacity: 0.4, lineHeight: 1, pointerEvents: "none",
            }}>
              &ldquo;
            </div>

            <p style={{
              fontSize: "1rem", fontStyle: "italic",
              color: "var(--parchment-dark)", lineHeight: 1.75,
              marginBottom: "1.5rem", position: "relative", zIndex: 1,
            }}>
              {t.text}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--stone)",
                border: "1px solid var(--gold-dark)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.85rem", color: "var(--gold)",
                flexShrink: 0,
              }}>
                {t.initials}
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.8rem", color: "var(--gold-light)",
                  letterSpacing: "0.05em",
                }}>
                  {t.name}
                </div>
                <div style={{
                  fontSize: "0.78rem", fontStyle: "italic",
                  color: "var(--text-muted)",
                }}>
                  {t.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}