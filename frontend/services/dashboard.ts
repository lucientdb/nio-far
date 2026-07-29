import api from "@/lib/api";

export type DashboardData = {
  role: string;
  dashboard_path: string;
  user: { id: number; nom: string; prenom: string; email: string; avatar_url?: string };
  stats: Record<string, number>;
};

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/api/dashboard/me");
  return data;
}
