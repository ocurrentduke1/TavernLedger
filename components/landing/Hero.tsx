import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-canvas px-8 pt-[clamp(5rem,10vh,8rem)] pb-[clamp(4rem,8vh,6rem)]">
      {/* Gradientes de fondo */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-100 dark:opacity-100"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 110%, var(--raw-gold) 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 20%, #8B1A1A 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 20% 80%, #D4601A 0%, transparent 60%)
          `,
          opacity: 0.08,
        }}
      />

      {/* Brillo izquierdo */}
      <div
        className="absolute rounded-full pointer-events-none opacity-[0.06] dark:opacity-[0.15]"
        style={{
          width: 300, height: 400,
          left: -80, top: "30%",
          filter: "blur(60px)",
          background: "radial-gradient(circle, #D4601A 0%, transparent 70%)",
          animation: "flicker 4s ease-in-out infinite alternate",
        }}
      />

      {/* Brillo derecho */}
      <div
        className="absolute rounded-full pointer-events-none opacity-[0.05] dark:opacity-[0.12]"
        style={{
          width: 300, height: 400,
          right: -80, top: "20%",
          filter: "blur(60px)",
          background: "radial-gradient(circle, var(--raw-gold) 0%, transparent 70%)",
          animation: "flicker 5s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Contenido */}
      <p
        className="relative z-10 font-cinzel text-[0.7rem] tracking-[0.4em] uppercase text-gold mb-6"
        style={{ animation: "fadeUp 0.8s 0.2s both" }}
      >
        — El libro de los aventureros —
      </p>

      <h1
        className="relative z-10 font-cinzel-dec text-[clamp(3.5rem,9vw,8rem)] leading-[0.95] text-gold"
        style={{
          textShadow: "0 0 80px color-mix(in oklab, var(--raw-gold) 30%, transparent), 0 4px 20px rgba(0,0,0,0.5)",
          animation: "fadeUp 0.9s 0.4s both",
        }}
      >
        TavernLedger
        <span className="block font-cinzel text-[clamp(1.8rem,4vw,3.5rem)] text-prose-soft font-normal tracking-[clamp(0.05em,1.5vw,0.3em)] mt-3">
          Chronicles &amp; Characters
        </span>
      </h1>

      {/* Divisor */}
      <div
        className="relative z-10 w-[min(320px,80%)] h-px my-10"
        style={{
          background: "linear-gradient(to right, transparent, var(--raw-gold-dim), var(--raw-gold), var(--raw-gold-dim), transparent)",
          animation: "fadeUp 0.8s 0.7s both",
        }}
      />

      <p
        className="relative z-10 text-[clamp(1.1rem,2.5vw,1.4rem)] italic text-prose-soft max-w-[560px] leading-[1.7]"
        style={{ animation: "fadeUp 0.8s 0.9s both" }}
      >
        Gestiona tus héroes, rastrea batallas, lanza dados y narra leyendas.
        Todo en un grimorio digital para tu grupo de D&amp;D.
      </p>

      <div
        className="relative z-10 flex gap-5 mt-12 flex-wrap justify-center"
        style={{ animation: "fadeUp 0.8s 1.1s both" }}
      >
        <Link
          href="/register"
          className="font-cinzel text-[0.85rem] tracking-[0.15em] uppercase text-canvas bg-gold border-none px-10 py-4 no-underline inline-block hover:bg-gold-subtle transition-colors duration-300 shadow-md"
        >
          Comenzar Aventura
        </Link>
        <a
          href="#features"
          className="font-cinzel text-[0.85rem] tracking-[0.15em] uppercase text-gold bg-transparent border border-gold-dim px-10 py-4 no-underline inline-block hover:border-gold transition-colors duration-300"
        >
          Ver el Grimorio
        </a>
      </div>
    </section>
  );
}
