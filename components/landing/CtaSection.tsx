import Link from "next/link";

export default function CtaSection() {
  return (
    <>
      {/* CTA */}
      <section className="relative bg-surface px-[clamp(2rem,5vw,4rem)] py-[clamp(5rem,10vw,10rem)] text-center overflow-hidden">
        {/* Línea superior */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--raw-gold-dim), var(--raw-gold), var(--raw-gold-dim), transparent)",
          }}
        />

        {/* Glow central */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.1]"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 50% 50%, var(--raw-gold) 0%, transparent 70%)",
          }}
        />

        <h2
          className="relative z-10 font-cinzel-dec text-[clamp(2rem,5vw,4rem)] text-gold mb-4 leading-[1.1]"
          style={{
            textShadow:
              "0 0 60px color-mix(in oklab, var(--raw-gold) 20%, transparent)",
          }}
        >
          ¿Listo para escribir tu leyenda?
        </h2>

        <p className="relative z-10 text-[1.2rem] italic text-prose-muted mb-12 leading-[1.6]">
          La taberna está abierta. Tu aventura espera en el Ledger.
        </p>

        <div className="relative z-10 flex gap-5 justify-center flex-wrap">
          <Link
            href="/register"
            className="font-cinzel text-[0.85rem] tracking-[0.15em] uppercase text-canvas bg-gold px-10 py-4 no-underline inline-block hover:bg-gold-subtle transition-colors duration-300 shadow-md"
          >
            Comenzar Gratis
          </Link>
          <Link
            href="#"
            className="font-cinzel text-[0.85rem] tracking-[0.15em] uppercase text-gold bg-transparent border border-gold-dim px-10 py-4 no-underline inline-block hover:border-gold transition-colors duration-300"
          >
            Ver Demostración
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-canvas border-t border-gold/10 px-[clamp(1.2rem,5vw,4rem)] py-12 flex items-center justify-between flex-wrap gap-6">
        <Link
          href="/"
          className="font-cinzel-dec text-[1.1rem] text-gold no-underline hover:text-gold-subtle transition-colors duration-300"
        >
          TavernLedger
        </Link>

        <ul className="flex gap-8 list-none flex-wrap">
          {["Características", "Precios", "Documentación", "Privacidad"].map(
            (item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="font-cinzel text-[0.7rem] tracking-[0.12em] uppercase text-prose-muted no-underline hover:text-gold transition-colors duration-300"
                >
                  {item}
                </Link>
              </li>
            )
          )}
        </ul>

        <span className="text-[0.85rem] italic text-prose-muted">
          Forjado con fuego de dragón · 2026
        </span>
      </footer>
    </>
  );
}
