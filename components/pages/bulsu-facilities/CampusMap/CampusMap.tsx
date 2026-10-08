"use client";

import { KeyboardEvent } from "react";
import { MapPinned } from "lucide-react";

import { CampusBuilding } from "../types/campus-building";
import {
  CAMPUS_BUILDINGS,
  CAMPUS_FILLER_BLOCKS,
  CAMPUS_MAP_VIEWBOX,
} from "./campus-buildings";

export interface CampusMapProps {
  // Facility count per building id; missing or 0 means none listed.
  facilityCounts: Record<string, number>;
  selectedBuildingId: string | null;
  handleBuildingSelect: (building: CampusBuilding) => void;
}

const LABEL_LINE_HEIGHT = 13;

// Short blocks stack their label one word per line so it stays inside.
function getLabelLines(building: CampusBuilding) {
  if (building.vertical || building.width >= 120) {
    return [building.name];
  }

  return building.name.split(" ");
}

function getFacilityCountText(count: number) {
  return `${count} ${count === 1 ? "facility" : "facilities"}`;
}

export default function CampusMap({
  facilityCounts,
  selectedBuildingId,
  handleBuildingSelect,
}: CampusMapProps) {
  function handleBuildingKeyDown(
    event: KeyboardEvent<SVGGElement>,
    building: CampusBuilding
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleBuildingSelect(building);
    }
  }

  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 text-bulsu" />

          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Campus map
          </span>
        </div>

        {/* Legend pairs each swatch with text so status is never color-only. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[4px] border border-bulsu/50 bg-bulsu/10" />
            Has facilities (count shown)
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[4px] border border-slate-300 bg-white" />
            None listed yet
          </span>

          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[4px] bg-bulsu" />
            Selected
          </span>
        </div>
      </div>

      <p className="mt-2 text-[13px] leading-5 text-slate-500">
        Pick a building, then choose a college to see its rooms there.
      </p>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Map scrolls sideways on small screens so labels stay legible. */}
        <div className="overflow-x-auto rounded-[20px] border border-slate-200/70 bg-slate-50/70">
          <svg
            viewBox={CAMPUS_MAP_VIEWBOX}
            role="group"
            aria-label="BulSU main campus map"
            className="block w-full min-w-[560px]"
          >
            {CAMPUS_FILLER_BLOCKS.map((block) => (
              <rect
                key={`${block.x}-${block.y}`}
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                rx={6}
                aria-hidden="true"
                className="fill-slate-200/70"
              />
            ))}

            {CAMPUS_BUILDINGS.map((building) => {
              const count = facilityCounts[building.id] ?? 0;
              const isSelected = selectedBuildingId === building.id;
              const hasFacilities = count > 0;
              const centerX = building.x + building.width / 2;
              const centerY = building.y + building.height / 2;
              const lines = getLabelLines(building);

              const shapeStyles = isSelected
                ? "fill-bulsu stroke-bulsu"
                : hasFacilities
                  ? "fill-bulsu/10 stroke-bulsu/50 group-hover:fill-bulsu/20"
                  : "fill-white stroke-slate-300 group-hover:fill-slate-100";

              const labelStyles = isSelected
                ? "fill-white"
                : hasFacilities
                  ? "fill-bulsu"
                  : "fill-slate-600";

              return (
                <g
                  key={building.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${building.name}, ${
                    hasFacilities
                      ? getFacilityCountText(count)
                      : "no facilities listed yet"
                  }`}
                  onClick={() => handleBuildingSelect(building)}
                  onKeyDown={(event) => handleBuildingKeyDown(event, building)}
                  className="group cursor-pointer outline-none"
                >
                  <rect
                    x={building.x}
                    y={building.y}
                    width={building.width}
                    height={building.height}
                    rx={building.kind === "grounds" ? 16 : 8}
                    strokeWidth={1.5}
                    strokeDasharray={
                      building.kind === "grounds" ? "5 4" : undefined
                    }
                    className={`transition-colors duration-200 group-focus-visible:stroke-slate-950 group-focus-visible:[stroke-width:3] ${shapeStyles}`}
                  />

                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={
                      building.vertical
                        ? `rotate(-90 ${centerX} ${centerY})`
                        : undefined
                    }
                    className={`pointer-events-none select-none text-[11px] font-semibold ${labelStyles}`}
                  >
                    {lines.map((line, index) => (
                      <tspan
                        key={line}
                        x={centerX}
                        y={
                          centerY +
                          (index - (lines.length - 1) / 2) * LABEL_LINE_HEIGHT
                        }
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {hasFacilities && (
                    <g aria-hidden="true" className="pointer-events-none">
                      <circle
                        cx={building.x + building.width - 3}
                        cy={building.y + 3}
                        r={9}
                        strokeWidth={1.5}
                        className={
                          isSelected
                            ? "fill-white stroke-bulsu"
                            : "fill-bulsu stroke-white"
                        }
                      />

                      <text
                        x={building.x + building.width - 3}
                        y={building.y + 3}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={`select-none text-[10px] font-bold ${
                          isSelected ? "fill-bulsu" : "fill-white"
                        }`}
                      >
                        {count}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Same choices as large touch targets, for phones and keyboards. */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Buildings
          </p>

          <ul className="mt-3 flex flex-wrap gap-2">
            {CAMPUS_BUILDINGS.map((building) => {
              const count = facilityCounts[building.id] ?? 0;
              const isSelected = selectedBuildingId === building.id;

              return (
                <li key={building.id}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleBuildingSelect(building)}
                    className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "border-bulsu bg-bulsu text-white shadow-[0_6px_16px_rgba(165,0,17,0.22)]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {building.name}

                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          isSelected
                            ? "bg-white text-bulsu"
                            : "bg-bulsu/10 text-bulsu"
                        }`}
                      >
                        <span className="sr-only">, </span>
                        {count}
                        <span className="sr-only">
                          {count === 1 ? " facility" : " facilities"}
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
