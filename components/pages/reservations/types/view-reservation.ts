// List/detail row shape for the Reservations tab.
export interface ViewReservation {
  id: number;
  purpose: string;
  status: string;
  start_time: string;
  end_time: string;
  user_id: string;
  facility_id: string;
  created_at: string;
  facility_name: string;
  facility_type: string;
}
