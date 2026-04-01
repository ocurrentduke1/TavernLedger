import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import QuickActions from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("dm_id", user?.id)
    .eq("status", "active")
    .limit(4);

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user?.id)
    .limit(4);

  return (
    <div style={{ padding: "3rem" }}>

      {/* Header */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)",
          marginBottom: "0.5rem",
        }}>
          Bienvenido de vuelta
        </p>
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
          color: "var(--parchment)", lineHeight: 1.2,
        }}>
          Panel del Aventurero
        </h1>
      </div>

      {/* Accesos rápidos */}
      <div style={{ marginBottom: "3rem" }}>
        <p style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "0.7rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--text-muted)",
          marginBottom: "1.2rem",
        }}>
          Acciones Rápidas
        </p>
        <QuickActions />
      </div>

      {/* Grid principal */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "2rem",
      }}>

        {/* Campañas activas */}
        <div>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "1.2rem",
          }}>
            <p style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.7rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "var(--text-muted)",
            }}>
              Campañas Activas
            </p>
            <Link href="/dashboard/campaigns" style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.65rem", letterSpacing: "0.1em",
              color: "var(--gold)", textDecoration: "none",
              textTransform: "uppercase",
            }}>
              Ver todas →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`} style={{
                  display: "block", padding: "1.2rem 1.5rem",
                  background: "rgba(58,50,40,0.4)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    fontFamily: "var(--font-cinzel), serif",
                    fontSize: "0.85rem", color: "var(--gold-light)",
                    marginBottom: "0.3rem",
                  }}>
                    {campaign.name}
                  </div>
                  <div style={{
                    fontSize: "0.8rem", fontStyle: "italic",
                    color: "var(--text-muted)",
                  }}>
                    {campaign.current_players}/{campaign.max_players} jugadores
                    · {campaign.is_public ? "Pública" : "Privada"}
                  </div>
                </Link>
              ))
            ) : (
              <div style={{
                padding: "2rem", textAlign: "center",
                background: "rgba(58,50,40,0.2)",
                border: "1px dashed rgba(201,168,76,0.12)",
              }}>
                <p style={{
                  fontSize: "0.9rem", fontStyle: "italic",
                  color: "var(--text-muted)", marginBottom: "1rem",
                }}>
                  Aún no tienes campañas activas
                </p>
                <Link href="/dashboard/campaigns/new" style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--ink)",
                  background: "var(--gold)", padding: "0.6rem 1.2rem",
                  textDecoration: "none", display: "inline-block",
                }}>
                  Crear Campaña
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mis personajes */}
        <div>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "1.2rem",
          }}>
            <p style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.7rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "var(--text-muted)",
            }}>
              Mis Personajes
            </p>
            <Link href="/dashboard/characters" style={{
              fontFamily: "var(--font-cinzel), serif",
              fontSize: "0.65rem", letterSpacing: "0.1em",
              color: "var(--gold)", textDecoration: "none",
              textTransform: "uppercase",
            }}>
              Ver todos →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {characters && characters.length > 0 ? (
              characters.map((char) => (
                <Link key={char.id} href={`/dashboard/characters/${char.id}`} style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1.2rem 1.5rem",
                  background: "rgba(58,50,40,0.4)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "var(--stone)",
                    border: "1px solid var(--gold-dark)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "1rem", color: "var(--gold)",
                    flexShrink: 0,
                  }}>
                    ⚔
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-cinzel), serif",
                      fontSize: "0.85rem", color: "var(--gold-light)",
                      marginBottom: "0.2rem",
                    }}>
                      {char.name}
                    </div>
                    <div style={{
                      fontSize: "0.78rem", fontStyle: "italic",
                      color: "var(--text-muted)",
                    }}>
                      {char.race} · {char.class} · Nv. {char.level}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{
                      fontFamily: "var(--font-cinzel), serif",
                      fontSize: "0.75rem", color: "var(--blood-light)",
                    }}>
                      {char.hp_current}/{char.hp_max} HP
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{
                padding: "2rem", textAlign: "center",
                background: "rgba(58,50,40,0.2)",
                border: "1px dashed rgba(201,168,76,0.12)",
              }}>
                <p style={{
                  fontSize: "0.9rem", fontStyle: "italic",
                  color: "var(--text-muted)", marginBottom: "1rem",
                }}>
                  Aún no tienes personajes
                </p>
                <Link href="/dashboard/characters/new" style={{
                  fontFamily: "var(--font-cinzel), serif",
                  fontSize: "0.75rem", letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--ink)",
                  background: "var(--gold)", padding: "0.6rem 1.2rem",
                  textDecoration: "none", display: "inline-block",
                }}>
                  Crear Personaje
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}