export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  college: {
    id: string;
    name: string;
    code: string;
  };
}
