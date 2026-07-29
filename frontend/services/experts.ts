import api from "@/lib/api";

export type Expert = {
  id: number;
  nom: string;
  specialite: string;
  organisation?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  photo_url?: string;
  est_actif: boolean;
  cree_le: string;
};

export async function getExperts(params?: { specialite?: string; ville?: string }): Promise<Expert[]> {
  const { data } = await api.get<Expert[]>("/api/experts/", { params: { limit: 100, ...params } });
  return data;
}

export async function createExpert(payload: {
  nom: string;
  specialite: string;
  organisation?: string;
  email?: string;
  telephone?: string;
  ville?: string;
  photo_url?: string;
}) {
  const { data } = await api.post<Expert>("/api/experts/", payload);
  return data;
}

export async function deleteExpert(id: number) {
  return api.delete(`/api/experts/${id}`);
}
