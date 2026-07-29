import api from "@/lib/api";

export type AnnuaireService = {
  id: number;
  nom: string;
  sigle?: string;
  categorie: string;
  description: string;
  missions: string[];
  contact: {
    telephone?: string;
    email?: string;
    site?: string;
    adresse?: string;
  };
  villes: string[];
  horaires?: string;
  gratuit: boolean;
  cree_le: string;
};

export async function getAnnuaireServices(categorie?: string): Promise<AnnuaireService[]> {
  const { data } = await api.get<AnnuaireService[]>("/api/annuaire-services/", {
    params: categorie && categorie !== "tous" ? { categorie } : {},
  });
  return data;
}

export async function getAnnuaireService(id: number): Promise<AnnuaireService> {
  const { data } = await api.get<AnnuaireService>(`/api/annuaire-services/${id}`);
  return data;
}

export async function createAnnuaireService(payload: {
  nom: string;
  sigle?: string;
  categorie: string;
  description: string;
  missions?: string;
  telephone?: string;
  email?: string;
  site?: string;
  adresse?: string;
  villes?: string;
  horaires?: string;
  gratuit?: boolean;
}) {
  const { data } = await api.post<AnnuaireService>("/api/annuaire-services/", payload);
  return data;
}

export async function deleteAnnuaireService(id: number) {
  return api.delete(`/api/annuaire-services/${id}`);
}
