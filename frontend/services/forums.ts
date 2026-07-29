import api from "@/lib/api";

export type Forum = {
  id: number;
  titre: string;
  description?: string;
  createur?: { id: number; nom: string; prenom: string };
  posts_count: number;
  pending_count?: number;
  cree_le: string;
};

export type Post = {
  id: number;
  titre: string;
  contenu: string;
  statut: string;
  est_publie: boolean;
  vues: number;
  forum_id: number;
  forum_titre?: string;
  auteur: { id: number; nom: string; prenom: string; avatar_url?: string; role: string };
  commentaires: Array<{
    id: number;
    contenu: string;
    auteur: { id: number; nom: string; prenom: string };
    cree_le: string;
  }>;
  likes_count: number;
  shares_count: number;
  liked_by_me: boolean;
  cree_le: string;
};

export type ShareRequest = {
  type?: "internal" | "message" | "external";
  receiver_id?: number | null;
  message?: string;
  confirmed?: boolean;
};

export async function getForums(): Promise<Forum[]> {
  const { data } = await api.get<Forum[]>("/api/forums/");
  return data;
}

export async function getForum(id: number): Promise<Forum> {
  const { data } = await api.get<Forum>(`/api/forums/${id}`);
  return data;
}

export async function getForumPosts(forumId: number): Promise<Post[]> {
  const { data } = await api.get<Post[]>(`/api/forums/${forumId}/posts`);
  return data;
}

export async function createForum(titre: string, description?: string) {
  const { data } = await api.post("/api/forums/", { titre, description });
  return data;
}

export async function createPost(forumId: number, titre: string, contenu: string) {
  const { data } = await api.post(`/api/forums/${forumId}/posts`, { titre, contenu });
  return data;
}

/** Post classique — tout utilisateur connecté */
export async function createClassicPost(titre: string, contenu: string, forumId?: number) {
  const { data } = await api.post("/api/posts/", {
    titre,
    contenu,
    forum_id: forumId ?? null,
  });
  return data;
}

export async function getPost(id: number): Promise<Post> {
  const { data } = await api.get<Post>(`/api/posts/${id}`);
  return data;
}

export async function getMyPosts(): Promise<Post[]> {
  const { data } = await api.get<Post[]>("/api/posts/me");
  return data;
}

export async function getPendingPosts(forumId: number): Promise<Post[]> {
  const { data } = await api.get<Post[]>(`/api/forums/${forumId}/posts/pending`);
  return data;
}

export async function approvePost(postId: number) {
  return api.put(`/api/posts/${postId}/approve`);
}

export async function rejectPost(postId: number) {
  return api.put(`/api/posts/${postId}/reject`);
}

export async function toggleLike(postId: number) {
  const { data } = await api.post(`/api/posts/${postId}/like`);
  return data;
}

export async function sharePost(postId: number, body: ShareRequest) {
  const { data } = await api.post(`/api/posts/${postId}/share`, body);
  return data;
}

export async function addComment(postId: number, contenu: string) {
  const { data } = await api.post(`/api/posts/${postId}/comments`, { contenu });
  return data;
}

export async function getMyForums(): Promise<Forum[]> {
  const { data } = await api.get<Forum[]>("/api/forums/me/forums");
  return data;
}
