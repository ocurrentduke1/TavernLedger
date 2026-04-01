"use client"

const features = [
  {
    title: "Fichas de Personaje",
    desc: "Crea y gestiona fichas completas con stats, habilidades, trasfondo, equipo e inventario. Todo sincronizado en tiempo real.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <rect x="8" y="6" width="32" height="44" rx="2" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
        <path d="M16 6V50" stroke="#8A6A1E" strokeWidth="1"/>
        <line x1="20" y1="16" x2="34" y2="16" stroke="#C9A84C" strokeWidth="1.5"/>
        <line x1="20" y1="22" x2="34" y2="22" stroke="#8A6A1E" strokeWidth="1"/>
        <line x1="20" y1="28" x2="30" y2="28" stroke="#8A6A1E" strokeWidth="1"/>
        <circle cx="40" cy="40" r="10" fill="#1A1410" stroke="#C9A84C" strokeWidth="1.5"/>
        <path d="M36 40L39 43L44 37" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Simulador de Dados",
    desc: "Lanza d4, d6, d8, d10, d12 y d20 con animaciones. Historial de tiradas, modificadores y tiradas de ventaja.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <path d="M28 8L44 20V36L28 48L12 36V20L28 8Z" stroke="#C9A84C" strokeWidth="1.5" fill="rgba(201,168,76,0.06)"/>
        <path d="M28 8L44 20" stroke="#8A6A1E" strokeWidth="1"/>
        <path d="M28 8L12 20" stroke="#8A6A1E" strokeWidth="1"/>
        <text x="28" y="32" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#C9A84C" fontWeight="bold">20</text>
      </svg>
    ),
  },
  {
    title: "Seguimiento en Partida",
    desc: "HP, condiciones, concentración, recursos y spell slots actualizados en vivo para todo el grupo simultáneamente.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <circle cx="28" cy="28" r="16" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
        <circle cx="28" cy="14" r="3" fill="#C9A84C"/>
        <circle cx="28" cy="42" r="3" fill="#C9A84C"/>
        <circle cx="14" cy="28" r="3" fill="#C9A84C"/>
        <circle cx="42" cy="28" r="3" fill="#C9A84C"/>
        <path d="M28 14V28L36 36" stroke="#8A6A1E" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Stats de Armas y Armaduras",
    desc: "Base de datos de equipo con cálculo automático de daño, CA y propiedades especiales. Compatible con todo el SRD 5e.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <path d="M10 46L20 20L36 36L42 14L50 46" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="3" fill="#C9A84C"/>
        <circle cx="36" cy="36" r="3" fill="#C9A84C"/>
        <circle cx="42" cy="14" r="3" fill="#C9A84C"/>
        <line x1="10" y1="46" x2="50" y2="46" stroke="#8A6A1E" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    title: "Mapas Interactivos",
    desc: "Sube mapas de tus mazmorras y ciudades. Coloca tokens de jugadores y enemigos, y comparte la vista en tiempo real.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <rect x="8" y="14" width="40" height="28" rx="2" stroke="#C9A84C" strokeWidth="1.5" fill="none"/>
        <path d="M8 22H48" stroke="#8A6A1E" strokeWidth="1"/>
        <circle cx="22" cy="30" r="4" fill="rgba(201,168,76,0.15)" stroke="#C9A84C" strokeWidth="1"/>
        <circle cx="34" cy="30" r="4" fill="rgba(139,26,26,0.2)" stroke="#8B1A1A" strokeWidth="1"/>
        <line x1="18" y1="44" x2="38" y2="44" stroke="#C9A84C" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    title: "IA para Trasfondos",
    desc: "Genera trasfondos únicos, nombres épicos, motivaciones y conexiones entre personajes con inteligencia artificial.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <path d="M28 10C18 10 10 18 10 28C10 38 18 46 28 46" stroke="#8A6A1E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M28 10C38 10 46 18 46 28C46 38 38 46 28 46" stroke="#C9A84C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="28" cy="28" r="6" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
        <path d="M28 16V20M28 36V40M16 28H20M36 28H40" stroke="#8A6A1E" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="28" cy="28" r="2" fill="#C9A84C"/>
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" style={{
      padding: "clamp(4rem, 8vw, 8rem) clamp(1.2rem, 5vw, 4rem)",
      position: "relative",
      background: "var(--stone)",
    }}>
      {/* Línea superior dorada */}
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
        El Grimorio de Herramientas
      </p>

      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "clamp(1.8rem, 4vw, 3rem)",
        textAlign: "center", color: "var(--parchment)",
        marginBottom: "1rem", lineHeight: 1.2,
      }}>
        Todo lo que un aventurero necesita
      </h2>

      <p style={{
        textAlign: "center", fontSize: "1.15rem",
        fontStyle: "italic", color: "var(--parchment-deeper)",
        maxWidth: 500, margin: "0 auto clamp(2.5rem, 5vw, 5rem)", lineHeight: 1.7,
      }}>
        Desde la creación de tu héroe hasta el seguimiento de la última batalla.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 2, maxWidth: 1200, margin: "0 auto",
      }}>
        {features.map((f) => (
          <div key={f.title} style={{
            background: "rgba(26,20,16,0.6)",
            padding: "clamp(1.5rem, 4vw, 3rem) clamp(1.2rem, 3vw, 2.5rem)",
            border: "1px solid rgba(201,168,76,0.12)",
            transition: "background 0.3s, border-color 0.3s",
            cursor: "default",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(26,20,16,0.85)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(26,20,16,0.6)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.12)";
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>{f.icon}</div>
            <h3 style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "1.1rem", letterSpacing: "0.05em",
              color: "var(--gold-light)", marginBottom: "0.8rem",
            }}>
              {f.title}
            </h3>
            <p style={{
              fontSize: "1rem",
              color: "var(--parchment-deeper)",
              lineHeight: 1.75,
            }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}