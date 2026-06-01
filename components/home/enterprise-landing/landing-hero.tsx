"use client";

type HeroStatStatus = "active" | "provisioned" | "inactive";

type HeroStat = {
  id: string;
  label: string;
  status: HeroStatStatus;
};

const STAT_STYLES: Record<
  HeroStatStatus,
  { dot: string; label: string; caption: string }
> = {
  active: {
    dot: "bg-ops-success shadow-[0_0_10px_rgba(6,95,70,0.45)]",
    label: "text-ops-success",
    caption: "Live infrastructure signal",
  },
  provisioned: {
    dot: "bg-ops-info shadow-[0_0_10px_rgba(37,99,235,0.35)]",
    label: "text-ops-info",
    caption: "Provisioned · enter a role for live status",
  },
  inactive: {
    dot: "bg-ops-text-dim/35",
    label: "text-ops-text-secondary",
    caption: "Awaiting configuration",
  },
};

type LandingHeroProps = {
  stats: HeroStat[];
};

export function LandingHero({ stats }: LandingHeroProps) {
  return (
    <section className="landing-hero relative overflow-hidden">
      <div className="landing-grid-bg" aria-hidden />
      <div className="landing-hero-glow" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-9 sm:px-6 sm:pt-20 sm:pb-11 lg:px-8 lg:pt-24 lg:pb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight text-ops-text sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Treasury Control Center
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ops-text-secondary sm:text-lg sm:leading-relaxed">
            Operational governance for institutional stablecoin settlement workflows — policy-driven
            authorization, MPC custody, and on-chain settlement powered by Fireblocks infrastructure.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const style = STAT_STYLES[stat.status];
            return (
              <div
                key={stat.id}
                className="landing-stat-float rounded-xl border border-ops-border/90 bg-ops-surface/95 px-4 py-3.5 shadow-[var(--ops-shadow-md)] backdrop-blur-sm"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
                    aria-hidden
                  />
                  <p className={`text-sm font-semibold ${style.label}`}>{stat.label}</p>
                </div>
                <p className="mt-1.5 text-[11px] text-ops-text-dim">{style.caption}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
