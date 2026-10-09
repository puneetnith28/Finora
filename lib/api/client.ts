/**
 * Finora Centralized API Client
 *
 * Handles base URL configuration, request timeouts, JSON serialization,
 * custom error wrapping, and structured HTTP responses.
 */

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export interface ApiErrorPayload {
  detail?: string | Array<{ loc?: (string | number)[]; msg?: string; type?: string }>;
  message?: string;
  error?: string;
  status_code?: number;
}

export class ApiClientError extends Error {
  public status: number;
  public data: ApiErrorPayload | null;

  constructor(status: number, message: string, data: ApiErrorPayload | null = null) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(baseUrl?: string, defaultTimeoutMs: number = 60000) {
    if (baseUrl !== undefined) {
      this.baseUrl = baseUrl.replace(/\/$/, "");
    } else if (typeof window !== "undefined") {
      // In the browser, use relative path so Next.js proxy rewrites handle it without CORS/port issues
      this.baseUrl = "";
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
    } else {
      this.baseUrl = "http://localhost:8000";
    }
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const urlString = `${this.baseUrl}${cleanEndpoint}`;

    let url: URL;
    if (typeof window !== "undefined" && !this.baseUrl.startsWith("http")) {
      url = new URL(urlString, window.location.origin);
    } else {
      url = new URL(urlString.startsWith("http") ? urlString : `http://localhost:8000${urlString}`);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const { timeoutMs = this.defaultTimeoutMs, params, headers, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

    const defaultHeaders: Record<string, string> = {};
    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }
    defaultHeaders["Accept"] = "application/json";

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
      });

      if (!response.ok) {
        let errorData: ApiErrorPayload | null = null;
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

        try {
          errorData = await response.json();
          if (errorData) {
            if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
              errorMessage = errorData.detail.map((d) => d.msg || "Validation error").join(", ");
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } catch {
          // Response was not JSON
          try {
            const rawText = await response.text();
            if (rawText) {
              errorMessage = rawText;
            }
          } catch {
            // Ignore failure to parse raw text
          }
        }

        throw new ApiClientError(response.status, errorMessage, errorData);
      }

      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ApiClientError(408, `Request timed out after ${timeoutMs}ms`);
      }

      const message = err instanceof Error ? err.message : "An unexpected network error occurred";
      throw new ApiClientError(0, message);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T>(endpoint: string, options?: Omit<ApiClientOptions, "method" | "body">): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiClientOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiClientOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<ApiClientOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public delete<T>(
    endpoint: string,
    options?: Omit<ApiClientOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  public upload<T>(
    endpoint: string,
    formData: FormData,
    options?: Omit<ApiClientOptions, "method" | "body">
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
    });
  }
}

export const api = new ApiClient();
export default api;
