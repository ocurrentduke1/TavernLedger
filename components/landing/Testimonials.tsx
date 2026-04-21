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
    <section id="testimonials" className="relative bg-canvas px-[clamp(1.2rem,5vw,4rem)] py-[clamp(4rem,8vw,8rem)]">
      {/* Línea superior */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: "linear-gradient(to right, transparent, #8B1A1A, transparent)",
        }}
      />

      <p className="font-cinzel text-[0.7rem] tracking-[0.4em] uppercase text-gold text-center mb-4">
        Voces de la Taberna
      </p>
      <h2 className="font-cinzel-dec text-[clamp(1.8rem,4vw,3rem)] text-center text-prose mb-[clamp(2.5rem,5vw,4rem)] leading-[1.2]">
        Aventureros que confían en el Ledger
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1000px] mx-auto">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="relative bg-surface/50 border border-gold/10 p-8 hover:border-gold/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300"
          >
            {/* Comilla decorativa */}
            <div className="absolute top-1 left-5 font-cinzel-dec text-[5rem] text-gold-dim opacity-25 leading-[1] pointer-events-none select-none">
              &ldquo;
            </div>

            <p className="text-[1rem] italic text-prose-soft leading-[1.75] mb-6 relative z-10">
              {t.text}
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface border border-gold-dim flex items-center justify-center font-cinzel text-[0.85rem] text-gold shrink-0">
                {t.initials}
              </div>
              <div>
                <div className="font-cinzel text-[0.8rem] text-gold-subtle tracking-[0.05em]">
                  {t.name}
                </div>
                <div className="text-[0.78rem] italic text-prose-muted">
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
