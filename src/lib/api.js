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
  const requestUrl = buildUrl(path);

  if (isJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  applyDevHeaders(headers);

  let response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
    throw new Error(
      `Unable to reach the backend for ${path}. Start the Flask backend or verify VITE_API_BASE_URL/VITE_DEV_BACKEND_URL.${detail}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? [payload.error, payload.details || payload.message].filter(Boolean).join(": ") ||
          `${response.status} ${response.statusText}`.trim()
        : payload || `${response.status} ${response.statusText}`.trim() || "API request failed.";
    throw new Error(message);
  }

  return payload;
}
