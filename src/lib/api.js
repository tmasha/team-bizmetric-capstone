const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";


function buildUrl(path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}


function applyDevHeaders(headers) {
  if (!import.meta.env.DEV) {
    return headers;
  }

  headers.set("x-debug-user-id", import.meta.env.VITE_DEBUG_USER_ID || "demo-user");
  headers.set("x-debug-user-email", import.meta.env.VITE_DEBUG_EMAIL || "demo.user@bizmetric.local");
  headers.set("x-debug-user-roles", import.meta.env.VITE_DEBUG_ROLE || "user");
  headers.set("x-debug-object-id", import.meta.env.VITE_DEBUG_OBJECT_ID || "debug-object-id");
  return headers;
}


export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isJsonBody = options.body && !headers.has("Content-Type");

  if (isJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  applyDevHeaders(headers);

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? payload.error || payload.details || "API request failed."
        : payload || "API request failed.";
    throw new Error(message);
  }

  return payload;
}
