"use client";

const features = [
  {
    id: "fichas",
    title: "Fichas de Personaje",
    desc: "Crea y gestiona fichas completas con stats, habilidades, trasfondo, equipo e inventario. Todo sincronizado en tiempo real.",
    variant: "large",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" width={72} height={72}>
        <rect x="10" y="8" width="40" height="56" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <path d="M20 8V64" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <line x1="26" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="26" y1="28" x2="44" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="26" y1="36" x2="40" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="26" y1="44" x2="38" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
        <circle cx="52" cy="52" r="12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M48 52L51 55L56 49" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "dados",
    title: "Simulador de Dados",
    desc: "Lanza d4 al d20 con animaciones. Historial, modificadores y ventaja.",
    variant: "default",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <path d="M28 8L44 20V36L28 48L12 36V20L28 8Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.2"/>
        <path d="M28 8L44 20M28 8L12 20M12 20V36M44 20V36M12 36L28 48M44 36L28 48" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <text x="28" y="33" textAnchor="middle" fontFamily="serif" fontSize="14" fill="currentColor" fontWeight="bold">20</text>
      </svg>
    ),
  },
  {
    id: "seguimiento",
    title: "Seguimiento en Partida",
    desc: "HP, condiciones, concentración y spell slots en vivo para todo el grupo.",
    variant: "default",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <circle cx="28" cy="28" r="16" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="28" cy="14" r="2.5" fill="currentColor"/>
        <circle cx="28" cy="42" r="2.5" fill="currentColor"/>
        <circle cx="14" cy="28" r="2.5" fill="currentColor"/>
        <circle cx="42" cy="28" r="2.5" fill="currentColor"/>
        <path d="M28 14V28L36 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "stats",
    title: "Stats de Equipo",
    desc: "Base de datos con cálculo automático de daño, CA y propiedades. Compatible con SRD 5e.",
    variant: "default",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <path d="M10 46L20 20L36 36L42 14L50 46" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="3" fill="currentColor"/>
        <circle cx="36" cy="36" r="3" fill="currentColor"/>
        <circle cx="42" cy="14" r="3" fill="currentColor"/>
        <line x1="10" y1="46" x2="50" y2="46" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: "mapas",
    title: "Mapas Interactivos",
    desc: "Sube mapas, coloca tokens y comparte la vista en tiempo real con tu grupo.",
    variant: "default",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <rect x="8" y="14" width="40" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M8 22H48" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        <circle cx="22" cy="30" r="4" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <circle cx="34" cy="30" r="4" fill="none" stroke="#8B1A1A" strokeWidth="1" opacity="0.8"/>
        <line x1="18" y1="44" x2="38" y2="44" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: "ia",
    title: "IA para Trasfondos",
    desc: "Genera trasfondos únicos, nombres épicos, motivaciones y conexiones entre personajes con inteligencia artificial.",
    variant: "accent",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={56} height={56}>
        <path d="M28 10C18 10 10 18 10 28C10 38 18 46 28 46" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
        <path d="M28 10C38 10 46 18 46 28C46 38 38 46 28 46" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <circle cx="28" cy="28" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M28 16V20M28 36V40M16 28H20M36 28H40" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <circle cx="28" cy="28" r="2.5" fill="currentColor"/>
      </svg>
    ),
  },
];

const cardBase =
  "group relative flex flex-col gap-5 p-[clamp(1.5rem,4vw,2.5rem)] border transition-all duration-300 cursor-default hover:-translate-y-0.5";

const variants: Record<string, string> = {
  default:
    "bg-canvas/60 border-gold/10 hover:border-gold/30 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30",
  large:
    "bg-canvas/60 border-gold/10 hover:border-gold/30 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 md:col-span-2 lg:col-span-2",
  accent:
    "bg-gold/5 border-gold/20 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 md:col-span-2 lg:col-span-2",
};

export default function Features() {
  return (
    <section id="features" className="relative bg-surface px-[clamp(1.2rem,5vw,4rem)] py-[clamp(4rem,8vw,8rem)]">
      {/* Línea superior */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--raw-gold-dim), var(--raw-gold), var(--raw-gold-dim), transparent)",
        }}
      />

      <p className="font-cinzel text-[0.7rem] tracking-[0.4em] uppercase text-gold text-center mb-4">
        El Grimorio de Herramientas
      </p>
      <h2 className="font-cinzel-dec text-[clamp(1.8rem,4vw,3rem)] text-center text-prose mb-4 leading-[1.2]">
        Todo lo que un aventurero necesita
      </h2>
      <p className="text-center text-[1.1rem] italic text-prose-muted max-w-[480px] mx-auto mb-[clamp(2.5rem,5vw,5rem)] leading-[1.7]">
        Desde la creación de tu héroe hasta el seguimiento de la última batalla.
      </p>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-[1200px] mx-auto">
        {features.map((f) => (
          <div key={f.id} className={`${cardBase} ${variants[f.variant]}`}>
            {/* Icono */}
            <div className={`text-gold ${f.variant === "large" ? "w-[72px] h-[72px]" : "w-[56px] h-[56px]"}`}>
              {f.icon}
            </div>

            <div>
              <h3
                className={`font-cinzel text-gold-subtle tracking-[0.04em] mb-2 ${
                  f.variant === "large" ? "text-[1.25rem]" : "text-[1rem]"
                }`}
              >
                {f.title}
              </h3>
              <p className="text-[0.95rem] text-prose-muted leading-[1.75]">
                {f.desc}
              </p>
            </div>

            {/* Accent badge para la IA */}
            {f.variant === "accent" && (
              <div className="absolute top-4 right-4 font-cinzel text-[0.55rem] tracking-[0.2em] uppercase text-gold border border-gold/20 px-2 py-1">
                IA
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
