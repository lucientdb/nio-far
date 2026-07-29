import api from "@/lib/api";

export type Temoignage = {
  id: number;
  titre: string;
  contenu: string;
  note?: number;
  service?: string;
  photo_url?: string;
  est_publie: boolean;
  auteur: { id: number; nom: string; prenom: string; avatar_url?: string };
  cree_le: string;
};

export type ServiceOption = { id: string; label: string };

export type ServiceStats = {
  par_service: Array<{ service: string; moyenne: number; count: number }>;
};

const SERVICE_LABELS: Record<string, string> = {
  forum: "Forum",
  emploi: "Emploi",
  education: "Éducation",
  medias: "Médias",
  services: "Services",
};

export function serviceLabel(id?: string) {
  return id ? SERVICE_LABELS[id] ?? id : "";
}

export async function getTemoignages(service?: string): Promise<Temoignage[]> {
  const { data } = await api.get<Temoignage[]>("/api/temoignages/", {
    params: service ? { service } : {},
  });
  return data;
}

export async function getTemoignageStats(): Promise<ServiceStats> {
  const { data } = await api.get<ServiceStats>("/api/temoignages/stats");
  return data;
}

export async function getServices(): Promise<ServiceOption[]> {
  const { data } = await api.get<ServiceOption[]>("/api/temoignages/services");
  return data;
}

export async function createTemoignage(payload: {
  titre: string;
  contenu: string;
  note: number;
  service: string;
}) {
  const { data } = await api.post<Temoignage>("/api/temoignages/", payload);
  return data;
}
