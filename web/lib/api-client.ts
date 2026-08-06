"use client";

import { useEffect, useState } from "react";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return (await res.json()) as T;
}

interface ApiEnvelope<T> {
  data: T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const body = await api<ApiEnvelope<T>>(path);
  return body.data;
}

export async function apiSend<T>(path: string, init: RequestInit): Promise<T> {
  const body = await api<ApiEnvelope<T>>(path, init);
  return body.data;
}

/**
 * Loads data from an API endpoint once on mount, falling back to a static
 * seed value so the UI renders even if the API is unavailable (offline /
 * static prerender). Returns the current value and a setter.
 */
export function useApiData<T>(path: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    let active = true;
    apiGet<T>(path)
      .then((value) => {
        if (active) setData(value);
      })
      .catch(() => {
        // Keep the static seed on failure; demo must never break.
      });
    return () => {
      active = false;
    };
  }, [path]);

  return [data, setData];
}
