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

export async function fetchEntryMetadata(
  pdbId: string,
  signal?: AbortSignal,
): Promise<EntryMetadata> {
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
  return {
    rcsbId: pdbId.toUpperCase(),
    resolution,
    method,
    releaseYear,
    title: data.struct?.title ?? null,
    cellA: data.cell?.length_a ?? null,
  };
}
