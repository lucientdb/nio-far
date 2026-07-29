import api from "@/lib/api";

export type Podcast = {
  id: number;
  titre: string;
  description?: string;
  format: "audio" | "video";
  media_url: string;
  couverture_url?: string;
  duree_secondes?: number;
  est_publie: boolean;
  auteur: { id: number; nom: string; prenom: string };
  cree_le: string;
};

export async function getPodcasts(format?: string): Promise<Podcast[]> {
  const { data } = await api.get<Podcast[]>("/api/podcasts/", {
    params: format ? { format } : {},
  });
  return data;
}

export async function getAllPodcasts(): Promise<Podcast[]> {
  const { data } = await api.get<Podcast[]>("/api/podcasts/admin/all");
  return data;
}

export async function createPodcast(payload: {
  titre: string;
  description?: string;
  format: "audio" | "video";
  media_url: string;
  couverture_url?: string;
  duree_secondes?: number;
}) {
  const { data } = await api.post<Podcast>("/api/podcasts/", payload);
  return data;
}

export async function deletePodcast(id: number) {
  return api.delete(`/api/podcasts/${id}`);
}
