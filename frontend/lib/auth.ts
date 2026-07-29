export type UserRole = "user" | "expert" | "entreprise" | "ong" | "admin";

export type UserInfo = {
  id: number;
  nom: string;
  prenom: string;
  username?: string | null;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  ville?: string | null;
};

const DASHBOARD_PATHS: Record<UserRole, string> = {
  admin: "/dashboard/admin",
  expert: "/dashboard/expert",
  entreprise: "/dashboard/recruteur",
  ong: "/dashboard/recruteur",
  user: "/dashboard",
};

export function getDashboardPath(role: string): string {
  return DASHBOARD_PATHS[role as UserRole] ?? "/dashboard";
}

export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserInfo;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() && getStoredUser());
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Membre",
  expert: "Expert",
  entreprise: "Entreprise",
  ong: "ONG",
  admin: "Administrateur",
};
