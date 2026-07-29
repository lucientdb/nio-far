import api from "@/lib/api";

export type Job = {
  id: number;
  titre: string;
  entreprise: string;
  description: string;
  lieu?: string;
  type_contrat?: string;
  est_actif: boolean;
  auteur: { id: number; nom: string; prenom: string };
  expire_le?: string;
  cree_le: string;
};

export async function getJobs(): Promise<Job[]> {
  const { data } = await api.get<Job[]>("/api/jobs/");
  return data;
}

export async function getMyJobs(): Promise<Job[]> {
  const { data } = await api.get<Job[]>("/api/jobs/me");
  return data;
}

export async function createJob(payload: {
  titre: string;
  entreprise: string;
  description: string;
  lieu?: string;
  type_contrat?: string;
}) {
  const { data } = await api.post<Job>("/api/jobs/", payload);
  return data;
}

export async function updateJob(id: number, payload: Partial<Job>) {
  const { data } = await api.put<Job>(`/api/jobs/${id}`, payload);
  return data;
}

export async function deleteJob(id: number) {
  return api.delete(`/api/jobs/${id}`);
}
