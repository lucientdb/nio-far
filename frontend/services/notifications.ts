import api from "@/lib/api";

export type Notification = {
  id: number;
  type: string;
  title: string;
  content: string;
  data?: string | null;
  read: boolean;
  cree_le: string;
};

export async function getMyNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>("/api/notifications/me");
  return data;
}

export async function getUnreadNotificationsCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/api/notifications/unread-count");
  return data.count;
}

export async function markNotificationRead(notificationId: number) {
  const { data } = await api.put(`/api/notifications/${notificationId}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.put("/api/notifications/read-all");
  return data;
}

export default {
  getMyNotifications,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
};
