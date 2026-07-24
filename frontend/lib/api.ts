import { unstable_cache } from "next/cache";
import type { ApiEnvelope, ApiErrorEnvelope, Project, SiteContent } from "@/types/api";

/**
 * Sunucu tarafı istekler için taban URL. Docker içinde servis adına
 * (http://api:4000/api), lokalde localhost'a bakar.
 */
const SERVER_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Tarayıcıdan yapılan istekler (iletişim formu, admin panel) için. */
export const BROWSER_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** İçeriğin tazelenme aralığı (saniye). */
const REVALIDATE_SECONDS = 60;

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function serverFetch<T>(path: string, revalidate = REVALIDATE_SECONDS): Promise<T> {
  const response = await fetch(`${SERVER_API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok || !payload) {
    const error = payload as ApiErrorEnvelope | null;
    throw new ApiError(response.status, error?.message ?? `İstek başarısız (${response.status})`);
  }

  return (payload as ApiEnvelope<T>).data;
}

/**
 * Veri katmanı `unstable_cache` ile sarılır, sayfalar build'de değil istek
 * anında render edilir.
 *
 * Neden: içerik veritabanından gelir ve dağıtımdan bağımsız değişir. Ayrıca
 * konteyner build'i izole bir ağda çalışır — API o anda erişilebilir değildir,
 * dolayısıyla build sırasında prerender etmek mümkün de değildir. Sonuç ISR'a
 * denk: ilk istek veriyi çeker, sonraki istekler REVALIDATE_SECONDS boyunca
 * cache'ten okur.
 */
export const getSiteContent = unstable_cache(
  () => serverFetch<SiteContent>("/site"),
  ["site-content"],
  { revalidate: REVALIDATE_SECONDS, tags: ["site"] },
);

export const getProjects = unstable_cache(
  () => serverFetch<Project[]>("/projects"),
  ["projects-list"],
  { revalidate: REVALIDATE_SECONDS, tags: ["projects"] },
);

export function getProjectBySlug(slug: string): Promise<Project> {
  return serverFetch<Project>(`/projects/${encodeURIComponent(slug)}`);
}
