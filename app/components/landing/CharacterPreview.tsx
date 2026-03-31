const stats = [
  { label: "Fuerza",       val: 14, mod: "+2" },
  { label: "Destreza",     val: 18, mod: "+4" },
  { label: "Constitución", val: 14, mod: "+2" },
  { label: "Inteligencia", val: 12, mod: "+1" },
  { label: "Sabiduría",    val: 16, mod: "+3" },
  { label: "Carisma",      val: 10, mod: "+0" },
];

const skills = [
  { name: "Percepción",   bonus: "+6", proficient: true  },
  { name: "Sigilo",       bonus: "+7", proficient: true  },
  { name: "Supervivencia",bonus: "+6", proficient: true  },
  { name: "Atletismo",    bonus: "+2", proficient: false },
];

const dice = ["d4", "d6", "d8", "d10", "d12", "d20"];

export default function CharacterPreview() {
  return (
    <section style={{
      padding: "8rem 4rem",
      background: "var(--ink)",
      textAlign: "center",
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
        marginBottom: "1rem",
      }}>
        La Ficha del Héroe
      </p>

      <h2 style={{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "clamp(1.8rem, 4vw, 3rem)",
        color: "var(--parchment)", marginBottom: "1rem", lineHeight: 1.2,
      }}>
        Tu personaje, vivo y en detalle
      </h2>

      <p style={{
        fontSize: "1.15rem", fontStyle: "italic",
        color: "var(--parchment-deeper)",
        maxWidth: 500, margin: "0 auto 4rem", lineHeight: 1.7,
      }}>
        Una interfaz diseñada para el campo de batalla y la taberna por igual.
      </p>

      {/* Frame */}
      <div style={{
        maxWidth: 900, margin: "0 auto",
        border: "1px solid rgba(201,168,76,0.25)",
        background: "rgba(58,50,40,0.6)",
        padding: "2.5rem",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 160px",
          gap: "1.5rem",
          textAlign: "left",
        }}>

          {/* Avatar */}
          <div style={{
            background: "rgba(26,20,16,0.8)",
            border: "1px solid rgba(201,168,76,0.2)",
            padding: "1.5rem",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "1rem",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--stone), var(--ink))",
              border: "2px solid var(--gold-dark)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.8rem", color: "var(--gold)",
            }}>⚔</div>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.9rem", color: "var(--gold-light)", textAlign: "center" }}>
              Aelindra Voss
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--parchment-deeper)", fontStyle: "italic", textAlign: "center" }}>
              Elfa · Ranger · Nv. 7
            </div>

            {/* HP Bar */}
            <div style={{ width: "100%" }}>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: "var(--blood-light)", letterSpacing: "0.1em", marginBottom: 4 }}>
                Puntos de Vida — 52 / 72
              </div>
              <div style={{ height: 8, background: "rgba(139,26,26,0.3)", borderRadius: 1 }}>
                <div style={{ height: "100%", width: "72%", background: "var(--blood-light)", borderRadius: 1 }} />
              </div>
            </div>

            {/* Spell Slots */}
            <div style={{ width: "100%" }}>
              <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.1em", marginBottom: 4 }}>
                Spell Slots · 3/4
              </div>
              <div style={{ height: 8, background: "rgba(201,168,76,0.15)", borderRadius: 1 }}>
                <div style={{ height: "100%", width: "75%", background: "var(--gold-dark)", borderRadius: 1 }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            background: "rgba(26,20,16,0.8)",
            border: "1px solid rgba(201,168,76,0.2)",
            padding: "1.5rem",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem",
            }}>
              {stats.map((s) => (
                <div key={s.label} style={{
                  background: "rgba(58,50,40,0.5)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  padding: "0.7rem", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.4rem", color: "var(--gold)", lineHeight: 1 }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--parchment-deeper)" }}>
                    {s.mod}
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginTop: "1rem" }}>
              {skills.map((sk) => (
                <div key={sk.name} style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.3rem 0",
                  borderBottom: "1px solid rgba(201,168,76,0.06)",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: sk.proficient ? "var(--gold)" : "var(--gold-dark)",
                  }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--parchment-deeper)", flex: 1 }}>
                    {sk.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.75rem", color: "var(--gold-light)" }}>
                    {sk.bonus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dados */}
          <div style={{
            background: "rgba(26,20,16,0.8)",
            border: "1px solid rgba(201,168,76,0.2)",
            padding: "1.5rem",
            display: "flex", flexDirection: "column", gap: "0.8rem",
          }}>
            <div style={{ fontFamily: "var(--font-cinzel), serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "0.3rem" }}>
              Lanzar Dado
            </div>
            {dice.map((d) => (
              <div key={d} style={{
                background: d === "d20" ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.08)",
                border: d === "d20" ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(201,168,76,0.2)",
                color: d === "d20" ? "var(--gold)" : "var(--gold-light)",
                fontFamily: "var(--font-cinzel), serif",
                fontSize: "0.75rem", padding: "0.5rem",
                textAlign: "center", cursor: "pointer",
                letterSpacing: "0.05em",
              }}>
                {d}
              </div>
            ))}
            <div style={{
              background: "rgba(139,26,26,0.2)",
              border: "1px solid rgba(139,26,26,0.3)",
              padding: "0.8rem", textAlign: "center",
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "1.8rem", color: "var(--blood-light)",
            }}>
              17
              <span style={{ fontSize: "0.6rem", color: "var(--parchment-deeper)", fontFamily: "var(--font-cinzel), serif", letterSpacing: "0.1em", display: "block", marginTop: 2 }}>
                Último resultado
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}