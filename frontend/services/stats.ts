import api from "@/lib/api";

export type PublicStats = {
  users_count: number;
  posts_count: number;
  jobs_count: number;
  temoignages_count: number;
  experts_count: number;
  podcasts_count: number;
  forums_count: number;
  ressources_count: number;
  services_count: number;
  photos_count: number;
};

export async function getPublicStats(): Promise<PublicStats> {
  const { data } = await api.get<PublicStats>("/api/stats/public");
  return data;
}
