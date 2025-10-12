import { apiFetch } from "./api";

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  relatedEntityType: string;
  relatedEntityId: number;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return await apiFetch("/api/notifications");
}

export async function getUnreadCount(): Promise<number> {
  // ✅ FIX: Backend returns just a number, not { count: number }
  const response = await apiFetch<number>("/api/notifications/unread-count");
  return response;
}

export async function markAsRead(id: number) {
  return await apiFetch(`/api/notifications/${id}/read`, {
    method: "PUT",
  });
}

export async function markAllAsRead() {
  return await apiFetch("/api/notifications/mark-all-read", {
    method: "PUT",
  });
}