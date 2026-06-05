import { buildApiUrl } from "../api-config";

type QueryParams = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  query?: QueryParams;
  init?: RequestInit;
};

function buildPath(path: string, query?: QueryParams) {
  const searchParams = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `${path}?${queryString}` : path;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(buildApiUrl(buildPath(path, options.query)), {
    ...options.init,
    headers: {
      "Content-Type": "application/json",
      ...options.init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string, query?: QueryParams) {
    return request<T>(path, { query });
  },
  post<TResponse, TBody>(path: string, body: TBody) {
    return request<TResponse>(path, {
      init: {
        method: "POST",
        body: JSON.stringify(body),
      },
    });
  },
  patch<TResponse, TBody>(path: string, body: TBody) {
    return request<TResponse>(path, {
      init: {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    });
  },
  delete(path: string) {
    return request<void>(path, {
      init: {
        method: "DELETE",
      },
    });
  },
};
