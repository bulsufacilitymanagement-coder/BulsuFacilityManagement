import { ViewFacility } from "../../facilities/types/view-facility";

export interface CatalogFacilityCollege {
  id: string;
  name: string;
  code: string;
}

// Public catalog row: a facility plus its owning college (joined).
export interface ViewCatalogFacility extends ViewFacility {
  college_id: string | null;
  college: CatalogFacilityCollege | null;
}
