import { api } from "./index";
import { adminApi } from "../services/adminApi";

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  data?: Record<string, unknown> | null;
  link?: string | null;
  read_at: string | null;
  created_at: string;
}

const getClient = () => {
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("access_token");
  if (adminToken && !userToken) {
    return adminApi;
  }
  return api;
};

export const notificationsApi = {
  list: (status?: "unread") =>
    getClient().get<NotificationItem[]>(
      `/messaging/notifications/${status ? `?status=${status}` : ""}`
    ),
  markRead: (id: number) =>
    getClient().post(`/messaging/notifications/${id}/mark_read/`),
  markAllRead: () => getClient().post(`/messaging/notifications/mark_all_read/`),
};
