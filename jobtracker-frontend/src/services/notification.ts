
import { getToken, handleUnauthorized } from "./auth";

import { buildApiUrl } from "./api";

export interface NotificationItem {
  id: number;
  applicationId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  readAt?   : string | null;
}

function authHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(buildApiUrl("/notifications"), {
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to load notifications");
  }
  return (await res.json()) as NotificationItem[];
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const res = await fetch(buildApiUrl(`/notifications/${notificationId}/read`), {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to mark notification as read");
  }
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(buildApiUrl("/notifications/unread-count"), {
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to load unread notifications count");
  }
  return (await res.json()) as number;
}

// export async function deleteNotification(notificationId: number): Promise<void> {
//   const res = await fetch(buildApiUrl(`/notifications/${notificationId}`), {
//     method: "DELETE",
//     headers: authHeaders(),
//   });
//   if (!res.ok) {
//     if (handleUnauthorized(res.status)) {
//       throw new Error("Unauthorized");
//     }
//     throw new Error("Failed to delete notification");
//   }
// }   