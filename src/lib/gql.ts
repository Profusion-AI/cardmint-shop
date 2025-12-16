import { z } from "zod";

// Widget schema (lenient props)
export const WidgetSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.string(),
  order: z.number().optional(),
  props: z.record(z.unknown()).optional(),
});

export type Widget = z.infer<typeof WidgetSchema>;

// Page schema
export const PageSchema = z.object({
  page: z.object({
    title: z.string(),
    slug: z.string(),
    widgets: z.array(WidgetSchema).default([]),
  }),
});

export type PageData = z.infer<typeof PageSchema>["page"];

type FetchOptions = {
  signal?: AbortSignal;
  retries?: number; // total attempts including first (default 1)
  retryDelayMs?: number; // base delay for backoff
};

/**
 * Minimal GraphQL POST helper through the Vite dev proxy.
 * - Uses credentials: 'include' for EverShop session cookies
 * - Throws on HTTP error or GraphQL errors[]
 * - Optional basic retry/backoff for transient 5xx
 */
export async function fetchGQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  opts: FetchOptions = {},
): Promise<T> {
  const { signal, retries = 1, retryDelayMs = 300 } = opts;

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query, variables }),
        signal,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Retry only on 5xx
        if (res.status >= 500 && res.status < 600 && attempt + 1 < retries) {
          attempt++;
          await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
          continue;
        }
        throw new Error(`GQL HTTP ${res.status}`);
      }

      if (json?.errors?.length) {
        const msg = json.errors[0]?.message || "GraphQL error";
        throw new Error(msg);
      }

      return json.data as T;
    } catch (err: unknown) {
      // Retry only on network errors if configured
      const msg = (err as Error)?.message || String(err);
      if (/abort/i.test(msg)) throw err; // do not retry aborted
      if (attempt + 1 < retries) {
        attempt++;
        await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

export async function getPage(slug: string, opts: FetchOptions = {}): Promise<PageData> {
  const query = /* GraphQL */ `
    query Page($slug: String!) {
      page(slug: $slug) {
        title
        slug
        widgets { id type order props }
      }
    }
  `;
  const data = await fetchGQL<{ page: unknown }>(query, { slug }, { retries: opts.retries ?? 2, retryDelayMs: opts.retryDelayMs ?? 300, signal: opts.signal });
  const parsed = PageSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid page payload");
  }
  return parsed.data.page;
}

