// export const API_BASE =
//   import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
//   "http://localhost:8080/api";

// export function buildApiUrl(path: string): string {
//   const normalizedPath = path.startsWith("/") ? path : `/${path}`;
//   return `${API_BASE}${normalizedPath}`;
// }


export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}