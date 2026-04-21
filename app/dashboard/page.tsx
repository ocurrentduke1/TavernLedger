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
    <div className="p-12">

      {/* Header */}
      <div className="mb-12">
        <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-gold mb-2">
          Bienvenido de vuelta
        </p>
        <h1 className="font-cinzel-dec text-[clamp(1.5rem,3vw,2.5rem)] text-prose leading-[1.2]">
          Panel del Aventurero
        </h1>
      </div>

      {/* Accesos rápidos */}
      <div className="mb-12">
        <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-prose-muted mb-5">
          Acciones Rápidas
        </p>
        <QuickActions />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Campañas activas */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-prose-muted">
              Campañas Activas
            </p>
            <Link href="/dashboard/campaigns" className="font-cinzel text-[0.65rem] tracking-[0.1em] text-gold no-underline uppercase hover:text-gold-subtle transition-colors">
              Ver todas →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`} className="block p-5 bg-surface/50 border border-gold/10 no-underline hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="font-cinzel text-[0.85rem] text-gold-subtle mb-2">
                    {campaign.name}
                  </div>
                  <div className="text-[0.8rem] italic text-prose-muted">
                    {campaign.current_players}/{campaign.max_players} jugadores
                    · {campaign.is_public ? "Pública" : "Privada"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center bg-surface/30 border border-dashed border-gold/15">
                <p className="text-[0.9rem] italic text-prose-muted mb-4">
                  Aún no tienes campañas activas
                </p>
                <Link href="/dashboard/campaigns/new" className="font-cinzel text-[0.75rem] tracking-[0.1em] uppercase text-canvas bg-gold px-5 py-2 no-underline inline-block hover:bg-gold-subtle transition-colors">
                  Crear Campaña
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mis personajes */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="font-cinzel text-[0.7rem] tracking-[0.3em] uppercase text-prose-muted">
              Mis Personajes
            </p>
            <Link href="/dashboard/characters" className="font-cinzel text-[0.65rem] tracking-[0.1em] text-gold no-underline uppercase hover:text-gold-subtle transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {characters && characters.length > 0 ? (
              characters.map((char) => (
                <Link key={char.id} href={`/dashboard/characters/${char.id}`} className="flex items-center gap-4 p-5 bg-surface/50 border border-gold/10 no-underline hover:border-gold/30 hover:-translate-y-0.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-surface border border-gold-dim flex items-center justify-center font-cinzel-dec text-base text-gold flex-shrink-0">
                    ⚔
                  </div>
                  <div className="flex-1">
                    <div className="font-cinzel text-[0.85rem] text-gold-subtle mb-1">
                      {char.name}
                    </div>
                    <div className="text-[0.78rem] italic text-prose-muted">
                      {char.race} · {char.class} · Nv. {char.level}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-cinzel text-[0.75rem] text-blood-ui">
                      {char.hp_current}/{char.hp_max} HP
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center bg-surface/30 border border-dashed border-gold/15">
                <p className="text-[0.9rem] italic text-prose-muted mb-4">
                  Aún no tienes personajes
                </p>
                <Link href="/dashboard/characters/new" className="font-cinzel text-[0.75rem] tracking-[0.1em] uppercase text-canvas bg-gold px-5 py-2 no-underline inline-block hover:bg-gold-subtle transition-colors">
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