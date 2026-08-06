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
 * Loads data from an API endpoint once on mount. Returns the current value
 * (undefined until the first successful load), a setter, and a `loading`
 * flag. Views render a skeleton while `loading` is true — no static seed data.
 */
export function useApiData<T>(path: string, fallback?: T): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>, boolean] {
  const [data, setData] = useState<T | undefined>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiGet<T>(path)
      .then((value) => {
        if (active) {
          setData(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path]);

  return [data, setData, loading];
}
