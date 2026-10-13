// A plain rectangle on the campus map, in SVG viewBox units.
export interface CampusBlock {
  x: number;
  y: number;
  width: number;
  height: number;
}

// A named, clickable place on the campus map.
export interface CampusBuilding extends CampusBlock {
  id: string;
  name: string;
  kind: "building" | "grounds";
  // Narrow blocks print their label rotated to fit.
  vertical?: boolean;
}

// A college that owns at least one facility in the picked building.
export interface BuildingCollegeOption {
  id: string;
  code: string;
  name: string;
  facilityCount: number;
}
