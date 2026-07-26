import { withTimeout } from "@/lib/withTimeout";

interface FetchProductsParams<T> {
  isConfigured: boolean;
  query: () => PromiseLike<{ data: T[] | null; error: unknown }>;
  fallback: T[];
  timeoutMs?: number;
}

export async function fetchProducts<T>({
  isConfigured,
  query,
  fallback,
  timeoutMs = 20000,
}: FetchProductsParams<T>): Promise<T[]> {
  if (!isConfigured) {
    return fallback;
  }

  try {
    const { data, error } = await withTimeout(
      query(),
      timeoutMs,
      "Product query timed out",
    );

    if (error) {
      console.error("fetchProducts query error, using fallback:", error);
      return fallback;
    }

    if (!data || data.length === 0) {
      console.warn("fetchProducts returned no data, using fallback");
      return fallback;
    }

    return data;
  } catch (err) {
    console.error("fetchProducts failed, using fallback:", err);
    return fallback;
  }
}
