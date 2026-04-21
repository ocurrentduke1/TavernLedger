const stats = [
  { label: "Fuerza",        val: 14, mod: "+2" },
  { label: "Destreza",      val: 18, mod: "+4" },
  { label: "Constitución",  val: 14, mod: "+2" },
  { label: "Inteligencia",  val: 12, mod: "+1" },
  { label: "Sabiduría",     val: 16, mod: "+3" },
  { label: "Carisma",       val: 10, mod: "+0" },
];

const skills = [
  { name: "Percepción",    bonus: "+6", proficient: true  },
  { name: "Sigilo",        bonus: "+7", proficient: true  },
  { name: "Supervivencia", bonus: "+6", proficient: true  },
  { name: "Atletismo",     bonus: "+2", proficient: false },
];

const dice = ["d4", "d6", "d8", "d10", "d12", "d20"];

export default function CharacterPreview() {
  return (
    <section className="relative bg-canvas px-[clamp(1.2rem,5vw,4rem)] py-[clamp(4rem,8vw,8rem)] text-center">
      {/* Línea superior */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: "linear-gradient(to right, transparent, #8B1A1A, transparent)",
        }}
      />

      <p className="font-cinzel text-[0.7rem] tracking-[clamp(0.1em,1.5vw,0.4em)] uppercase text-gold mb-4">
        La Ficha del Héroe
      </p>
      <h2 className="font-cinzel-dec text-[clamp(1.8rem,4vw,3rem)] text-prose mb-4 leading-[1.2]">
        Tu personaje, vivo y en detalle
      </h2>
      <p className="text-[1.1rem] italic text-prose-muted max-w-[500px] mx-auto mb-[clamp(2rem,4vw,4rem)] leading-[1.7]">
        Una interfaz diseñada para el campo de batalla y la taberna por igual.
      </p>

      {/* Frame principal */}
      <div className="max-w-[900px] mx-auto border border-gold/20 bg-surface/50 p-[clamp(1.2rem,3vw,2.5rem)] shadow-xl shadow-black/10 dark:shadow-black/40">
        {/* Grid: avatar | stats | dice */}
        <div className="grid grid-cols-1 min-[560px]:grid-cols-[180px_1fr] min-[860px]:grid-cols-[200px_1fr_160px] gap-4 text-left">

          {/* Avatar */}
          <div className="bg-canvas/80 border border-gold/15 p-5 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full shrink-0 border-2 border-gold-dim flex items-center justify-center font-cinzel-dec text-[1.8rem] text-gold bg-gradient-to-br from-surface to-canvas">
              ⚔
            </div>
            <div className="w-full flex flex-col gap-3">
              <div className="font-cinzel text-[0.9rem] text-gold-subtle text-center">
                Aelindra Voss
              </div>
              <div className="text-[0.8rem] text-prose-muted italic text-center">
                Elfa · Ranger · Nv. 7
              </div>

              {/* HP Bar */}
              <div className="w-full">
                <div className="font-cinzel text-[0.6rem] text-blood-ui tracking-[0.1em] mb-1">
                  Puntos de Vida — 52 / 72
                </div>
                <div className="h-2 bg-blood/20 rounded-sm">
                  <div className="h-full w-[72%] bg-blood-ui rounded-sm" />
                </div>
              </div>

              {/* Spell Slots */}
              <div className="w-full">
                <div className="font-cinzel text-[0.6rem] text-gold tracking-[0.1em] mb-1">
                  Spell Slots · 3/4
                </div>
                <div className="h-2 bg-gold/10 rounded-sm">
                  <div className="h-full w-[75%] bg-gold-dim rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-canvas/80 border border-gold/15 p-5">
            <div className="grid grid-cols-3 gap-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-surface/50 border border-gold/10 p-2 text-center"
                >
                  <div className="font-cinzel text-[0.5rem] tracking-[0.1em] text-prose-muted uppercase mb-1">
                    {s.label}
                  </div>
                  <div className="font-cinzel-dec text-[1.4rem] text-gold leading-[1]">
                    {s.val}
                  </div>
                  <div className="text-[0.7rem] text-prose-muted">{s.mod}</div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mt-3">
              {skills.map((sk) => (
                <div
                  key={sk.name}
                  className="flex items-center gap-2 py-1 border-b border-gold/5 last:border-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      sk.proficient ? "bg-gold" : "bg-gold-dim"
                    }`}
                  />
                  <span className="text-[0.75rem] text-prose-muted flex-1">
                    {sk.name}
                  </span>
                  <span className="font-cinzel text-[0.75rem] text-gold-subtle">
                    {sk.bonus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dados */}
          <div className="bg-canvas/80 border border-gold/15 p-5 flex flex-col gap-3 min-[560px]:col-span-2 min-[860px]:col-span-1">
            <div className="font-cinzel text-[0.6rem] tracking-[0.1em] text-gold uppercase">
              Lanzar Dado
            </div>

            <div className="grid grid-cols-3 min-[860px]:grid-cols-2 gap-1">
              {dice.map((d) => (
                <div
                  key={d}
                  className={[
                    "font-cinzel text-[0.75rem] p-2 text-center cursor-pointer tracking-[0.05em]",
                    "border transition-colors duration-200",
                    d === "d20"
                      ? "bg-gold/12 border-gold/35 text-gold"
                      : "bg-gold/6 border-gold/18 text-gold-subtle hover:border-gold/30",
                  ].join(" ")}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-auto bg-blood/15 border border-blood/25 p-3 text-center">
              <div className="font-cinzel-dec text-[1.8rem] text-blood-ui leading-[1]">
                17
              </div>
              <span className="font-cinzel text-[0.55rem] text-prose-muted tracking-[0.1em]">
                Último resultado
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
