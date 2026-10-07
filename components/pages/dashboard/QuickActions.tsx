import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { QuickAction } from "./types/dashboard";

// Tile tones match the brand palette (bulsu primary, gold accent, dark neutral).
const TILE_STYLES: Record<QuickAction["tone"], string> = {
  bulsu: "bg-bulsu text-white",
  gold: "bg-gold text-[#5f4700]",
  dark: "bg-slate-900 text-white",
};

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon: LucideIcon = action.icon;

        return (
          <Link
            key={action.href + action.label}
            href={action.href}
            className="group flex items-center gap-4 rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${TILE_STYLES[action.tone]}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-slate-900">
                {action.label}
              </p>

              <p className="mt-0.5 truncate text-[12px] text-slate-500">
                {action.description}
              </p>
            </div>

            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-bulsu" />
          </Link>
        );
      })}
    </div>
  );
}
