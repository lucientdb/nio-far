import api from "@/lib/api";

export type Ressource = {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  duree?: string;
  niveau?: string;
  lien?: string;
  cree_le: string;
};

export async function getRessources(categorie?: string): Promise<Ressource[]> {
  const { data } = await api.get<Ressource[]>("/api/ressources/", {
    params: categorie && categorie !== "toutes" ? { categorie } : {},
  });
  return data;
}

export async function createRessource(payload: {
  titre: string;
  description: string;
  categorie: string;
  duree?: string;
  niveau?: string;
  lien?: string;
}) {
  const { data } = await api.post("/api/ressources/", payload);
  return data;
}

export async function deleteRessource(id: number) {
  return api.delete(`/api/ressources/${id}`);
}
