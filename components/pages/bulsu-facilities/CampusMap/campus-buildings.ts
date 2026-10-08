import { CampusBlock, CampusBuilding } from "../types/campus-building";

// 2D layout traced from the BulSU main campus map, in viewBox units.
// Neighbours are snapped to shared edges with 10/20-unit gaps — keep new
// blocks on those guides so the map stays tidy.
export const CAMPUS_MAP_VIEWBOX = "0 0 690 710";

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "mendoza-hall",
    name: "Mendoza Hall",
    kind: "building",
    x: 80,
    y: 50,
    width: 310,
    height: 52,
  },
  {
    id: "cssp-grounds",
    name: "CSSP Grounds",
    kind: "grounds",
    x: 80,
    y: 122,
    width: 160,
    height: 70,
  },
  {
    id: "federizo-hall",
    name: "Federizo Hall",
    kind: "building",
    x: 260,
    y: 122,
    width: 130,
    height: 130,
  },
  {
    id: "valencia-hall",
    name: "Valencia Hall",
    kind: "building",
    x: 520,
    y: 106,
    width: 150,
    height: 64,
  },
  {
    id: "flores-hall",
    name: "Flores Hall",
    kind: "building",
    x: 520,
    y: 190,
    width: 150,
    height: 50,
  },
  {
    id: "natividad-hall",
    name: "Natividad Hall",
    kind: "building",
    x: 520,
    y: 260,
    width: 150,
    height: 80,
  },
  {
    id: "heroes-park",
    name: "Heroes' Park",
    kind: "grounds",
    x: 340,
    y: 300,
    width: 100,
    height: 90,
  },
  {
    id: "e-library",
    name: "E-Library",
    kind: "building",
    x: 110,
    y: 300,
    width: 90,
    height: 90,
  },
  {
    id: "slrc",
    name: "SLRC",
    kind: "building",
    x: 210,
    y: 300,
    width: 30,
    height: 90,
    vertical: true,
  },
  {
    id: "cbea",
    name: "CBEA",
    kind: "building",
    x: 250,
    y: 300,
    width: 30,
    height: 90,
    vertical: true,
  },
  {
    id: "carpio-hall",
    name: "Carpio Hall",
    kind: "building",
    x: 260,
    y: 410,
    width: 210,
    height: 40,
  },
  {
    id: "college-of-law",
    name: "College of Law",
    kind: "building",
    x: 260,
    y: 460,
    width: 210,
    height: 40,
  },
  {
    id: "roxas-hall",
    name: "Roxas Hall",
    kind: "building",
    x: 490,
    y: 410,
    width: 80,
    height: 40,
  },
  {
    id: "pimentel-hall",
    name: "Pimentel Hall",
    kind: "building",
    x: 590,
    y: 520,
    width: 80,
    height: 160,
  },
  {
    id: "chtm",
    name: "CHTM",
    kind: "building",
    x: 20,
    y: 410,
    width: 220,
    height: 90,
  },
  {
    id: "open-area",
    name: "Open Area",
    kind: "grounds",
    x: 20,
    y: 520,
    width: 220,
    height: 70,
  },
  {
    id: "rizal-park",
    name: "Rizal Park",
    kind: "grounds",
    x: 260,
    y: 520,
    width: 310,
    height: 70,
  },
  {
    id: "activity-center",
    name: "Activity Center",
    kind: "building",
    x: 260,
    y: 610,
    width: 310,
    height: 70,
  },
  {
    id: "alvarado-hall",
    name: "Alvarado Hall",
    kind: "building",
    x: 20,
    y: 610,
    width: 220,
    height: 70,
  },
];

// Unnamed blocks on the source map, drawn for orientation only.
export const CAMPUS_FILLER_BLOCKS: CampusBlock[] = [
  { x: 20, y: 50, width: 40, height: 52 },
  { x: 520, y: 30, width: 150, height: 44 },
  { x: 520, y: 84, width: 150, height: 10 },
  { x: 80, y: 300, width: 20, height: 90 },
  { x: 490, y: 460, width: 80, height: 40 },
];

// facilities.location is free text ("Pimentel Hall - 4th Floor"), so a
// facility belongs to a building when the building name appears in it.
export function isFacilityInBuilding(
  location: string | null | undefined,
  building: CampusBuilding
) {
  return (location ?? "").toLowerCase().includes(building.name.toLowerCase());
}
