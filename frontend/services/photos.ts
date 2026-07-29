import api from "@/lib/api";

export type Photo = {
  id: number;
  titre: string;
  lieu?: string;
  image_url: string;
  cree_le: string;
};

export async function getPhotos(): Promise<Photo[]> {
  const { data } = await api.get<Photo[]>("/api/photos/");
  return data;
}

export async function createPhoto(payload: { titre: string; lieu?: string; image_url: string }) {
  const { data } = await api.post("/api/photos/", payload);
  return data;
}

export async function deletePhoto(id: number) {
  return api.delete(`/api/photos/${id}`);
}
