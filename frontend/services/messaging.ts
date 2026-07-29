import api from "@/lib/api";

export type Message = {
  id: number;
  sender: { id: number; nom: string; prenom: string; avatar_url?: string | null; role: string };
  receiver: { id: number; nom: string; prenom: string; avatar_url?: string | null; role: string };
  post_id?: number | null;
  contenu: string;
  lu: boolean;
  cree_le: string;
};

export async function sendMessage(receiver_id: number, contenu: string, postId?: number) {
  const { data } = await api.post("/api/messages/send", { receiver_id, contenu, post_id: postId });
  return data;
}

export async function getMyMessages(): Promise<Message[]> {
  const { data } = await api.get<Message[]>("/api/messages/me");
  return data;
}

export async function getSentMessages(): Promise<Message[]> {
  const { data } = await api.get<Message[]>("/api/messages/sent");
  return data;
}

export async function getUnreadMessagesCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/api/messages/unread-count");
  return data.count;
}

export async function markMessageRead(messageId: number) {
  const { data } = await api.put(`/api/messages/${messageId}/read`);
  return data;
}

export async function markAllMessagesRead() {
  const { data } = await api.put("/api/messages/read-all");
  return data;
}

export default {
  sendMessage,
  getMyMessages,
  getSentMessages,
  getUnreadMessagesCount,
  markMessageRead,
  markAllMessagesRead,
};
