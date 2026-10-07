import type { LucideIcon } from "lucide-react";
import type { DashboardStat } from "../types/dashboard";

// Tone map keeps status color language consistent (see AGENTS.md §5).
const TONE_STYLES: Record<DashboardStat["tone"], { bg: string; color: string }> = {
  bulsu: { bg: "bg-bulsu/[0.07]", color: "text-bulsu" },
  gold: { bg: "bg-gold/15", color: "text-[#8a6100]" },
  green: { bg: "bg-emerald-50", color: "text-emerald-600" },
  slate: { bg: "bg-slate-100", color: "text-slate-500" },
};

interface StatCardProps {
  stat: DashboardStat;
  loading?: boolean;
}

export function StatCard({ stat, loading = false }: StatCardProps) {
  const Icon: LucideIcon = stat.icon;
  const tone = TONE_STYLES[stat.tone];

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200/70 bg-white p-6">
        <div className="h-[68px] animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
          {stat.label}
        </span>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tone.bg}`}
        >
          <Icon className={`h-5 w-5 ${tone.color}`} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-[36px] font-bold tracking-tight text-slate-950">
          {stat.value}
        </span>

        <span className="text-[12px] font-semibold text-slate-500">
          {stat.subtext}
        </span>
      </div>
    </div>
  );
}
