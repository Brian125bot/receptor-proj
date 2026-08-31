export interface EntryMetadata {
  rcsbId: string;
  resolution: number | null;
  method: string | null;
  releaseYear: number | null;
  title: string | null;
  cellA: number | null;
}

interface GraphQLResponse {
  data?: {
    entry?: {
      rcsb_entry_info?: {
        resolution_combined?: number[] | null;
        experimental_method?: string | null;
      } | null;
      rcsb_accession_info?: {
        initial_release_date?: string | null;
      } | null;
      struct?: { title?: string | null } | null;
      exptl?: { method?: string | null }[] | null;
      cell?: { length_a?: number | null } | null;
    } | null;
  };
  errors?: unknown;
}

const ENDPOINT = "https://data.rcsb.org/graphql";

const QUERY = /* GraphQL */ `
  query EntrySummary($id: String!) {
    entry(entry_id: $id) {
      rcsb_entry_info {
        resolution_combined
        experimental_method
      }
      rcsb_accession_info {
        initial_release_date
      }
      struct {
        title
      }
      exptl {
        method
      }
      cell {
        length_a
      }
    }
  }
`;

const CACHE_KEY_PREFIX = "mu-opioid-metadata-";

function getCacheKey(pdbId: string): string {
  return `${CACHE_KEY_PREFIX}${pdbId.toUpperCase()}`;
}

function readCache(pdbId: string): EntryMetadata | null {
  try {
    const raw = localStorage.getItem(getCacheKey(pdbId));
    if (!raw) return null;
    return JSON.parse(raw) as EntryMetadata;
  } catch {
    return null;
  }
}

function writeCache(pdbId: string, data: EntryMetadata): void {
  try {
    localStorage.setItem(getCacheKey(pdbId), JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export async function fetchEntryMetadata(
  pdbId: string,
  signal?: AbortSignal,
  retries = 3,
): Promise<EntryMetadata> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: QUERY, variables: { id: pdbId } }),
        signal,
      });
      if (!res.ok) {
        throw new Error(`RCSB GraphQL ${res.status} ${res.statusText}`);
      }
      const json = (await res.json()) as GraphQLResponse;
      if (json.errors) {
        throw new Error(`RCSB GraphQL errors: ${JSON.stringify(json.errors)}`);
      }
      const data = json.data?.entry;
      if (!data) {
        throw new Error(`No entry returned for ${pdbId}`);
      }
      const resolutionList = data.rcsb_entry_info?.resolution_combined ?? null;
      const resolution =
        resolutionList && resolutionList.length > 0
          ? resolutionList.reduce((a, b) => a + b, 0) / resolutionList.length
          : null;
      const releaseDate = data.rcsb_accession_info?.initial_release_date ?? null;
      const releaseYear = releaseDate ? Number(releaseDate.slice(0, 4)) : null;
      const method = data.exptl?.[0]?.method ?? data.rcsb_entry_info?.experimental_method ?? null;
      const result: EntryMetadata = {
        rcsbId: pdbId.toUpperCase(),
        resolution,
        method,
        releaseYear,
        title: data.struct?.title ?? null,
        cellA: data.cell?.length_a ?? null,
      };
      writeCache(pdbId, result);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  // All retries exhausted — fall back to cached data
  const cached = readCache(pdbId);
  if (cached) return cached;
  throw lastError ?? new Error("Failed to fetch metadata");
}
