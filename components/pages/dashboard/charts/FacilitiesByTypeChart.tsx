"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { FacilityTypeCount } from "../types/dashboard";

interface FacilitiesByTypeChartProps {
  data: FacilityTypeCount[];
  loading?: boolean;
}

export function FacilitiesByTypeChart({
  data,
  loading = false,
}: FacilitiesByTypeChartProps) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Inventory
          </p>

          <h2 className="mt-1 text-[18px] font-bold text-slate-950">
            Facilities by Type
          </h2>
        </div>

        <span className="rounded-full bg-bulsu/[0.07] px-3 py-1 text-[12px] font-bold text-bulsu">
          {loading ? "…" : `${total} total`}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 h-[260px] animate-pulse rounded-2xl bg-slate-100" />
      ) : data.length === 0 ? (
        <ChartEmpty message="No facilities yet. Add your first facility to see the breakdown." />
      ) : (
        <div
          className="mt-4 h-[260px] w-full"
          role="img"
          aria-label={`Bar chart of facilities by type, ${total} total`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

              <XAxis
                dataKey="type"
                tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={52}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(165,0,17,0.05)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />

              <Bar dataKey="count" name="Facilities" fill="#a50011" radius={[8, 8, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// Shared empty state for charts with no data yet.
export function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="mt-4 flex h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-bulsu/[0.07]">
        <BarChart3 className="h-5 w-5 text-bulsu" />
      </div>

      <p className="mt-3 max-w-[260px] text-[13px] leading-5 text-slate-500">
        {message}
      </p>
    </div>
  );
}
