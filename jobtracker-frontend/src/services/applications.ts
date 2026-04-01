import { getToken, handleUnauthorized } from "./auth";
import { buildApiUrl } from "./api";

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "OA"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "OA",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  OA: "OA",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  source?: string;
  status: ApplicationStatus;
  appliedDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  followUpDate?: string | null;
  reminderEnabled?: boolean;
  remindeAt?: string | null;
  lastNotifiedAt?: string | null;
}

export interface JobApplicationPayload {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  source?: string;
  status?: ApplicationStatus;
  appliedDate?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  reminderEnabled?: boolean;
  remindeAt?: string | null;
}

function authHeaders() {
  const token = getToken();
  if (!token) {
    throw new Error("No auth token");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchApplications(): Promise<JobApplication[]> {
  const res = await fetch(buildApiUrl("/applications"), {
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to load applications");
  }
  return (await res.json()) as JobApplication[];
}

export async function createApplication(
  payload: JobApplicationPayload,
): Promise<JobApplication> {
  const res = await fetch(buildApiUrl("/applications"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Failed to create application");
  }
  return (await res.json()) as JobApplication;
}

export async function updateApplication(
  id: number,
  payload: Partial<JobApplicationPayload>,
): Promise<JobApplication> {
  const res = await fetch(buildApiUrl(`/applications/${id}`), {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Failed to update application");
  }
  return (await res.json()) as JobApplication;
}

export async function deleteApplication(id: number): Promise<void> {
  const res = await fetch(buildApiUrl(`/applications/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Failed to delete application");
  }
}

export async function fetchDueFollowUps(): Promise<JobApplication[]> {
  const res = await fetch(buildApiUrl("/applications/follow-ups/due"), {
    headers: authHeaders(),
  });
  if (!res.ok) {
    if (handleUnauthorized(res.status)) {
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to load due follow-ups");
  }
  return (await res.json()) as JobApplication[];
} 
