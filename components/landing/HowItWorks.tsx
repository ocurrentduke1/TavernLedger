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
    <section id="how" className="relative bg-surface px-[clamp(1.2rem,5vw,4rem)] py-[clamp(4rem,8vw,8rem)]">
      {/* Línea superior */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--raw-gold-dim), var(--raw-gold), var(--raw-gold-dim), transparent)",
        }}
      />

      <p className="font-cinzel text-[0.7rem] tracking-[0.4em] uppercase text-gold text-center mb-4">
        El Camino del Héroe
      </p>
      <h2 className="font-cinzel-dec text-[clamp(1.8rem,4vw,3rem)] text-center text-prose mb-4 leading-[1.2]">
        Cómo funciona
      </h2>
      <p className="text-center text-[1.1rem] italic text-prose-muted max-w-[480px] mx-auto mb-[clamp(3rem,6vw,6rem)] leading-[1.7]">
        En cuatro pasos, tu grupo estará listo para la aventura.
      </p>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1000px] mx-auto">
        {/* Línea conectora — solo desktop */}
        <div
          className="hidden lg:block absolute h-px"
          style={{
            top: 36,
            left: "12%",
            right: "12%",
            background:
              "linear-gradient(to right, transparent, var(--raw-gold-dim), var(--raw-gold-dim), transparent)",
          }}
        />

        {steps.map((s, i) => (
          <div key={s.num} className="flex flex-col items-center text-center relative px-4">
            {/* Número */}
            <div
              className="relative z-10 w-18 h-18 rounded-full border-2 border-gold-dim bg-canvas flex items-center justify-center font-cinzel-dec text-[1.4rem] text-gold mb-6 shadow-md"
              style={{ width: 72, height: 72 }}
            >
              {s.num}
              {/* Glow sutil en hover */}
              <div className="absolute inset-0 rounded-full bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Conector vertical móvil */}
            {i < steps.length - 1 && (
              <div
                className="lg:hidden absolute left-1/2 -translate-x-1/2 w-px"
                style={{
                  top: 72,
                  height: 32,
                  background:
                    "linear-gradient(to bottom, var(--raw-gold-dim), transparent)",
                }}
              />
            )}

            <h3 className="font-cinzel text-[0.9rem] tracking-[0.05em] text-gold-subtle mb-2">
              {s.title}
            </h3>
            <p className="text-[0.95rem] italic text-prose-muted leading-[1.6]">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
