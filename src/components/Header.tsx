import type { EntryMetadata } from "../lib/rcsb";

interface HeaderProps {
  metadata: EntryMetadata | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

function formatResolution(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(2)} Å`;
}

function formatMethod(value: string | null): string {
  if (!value) return "—";
  // RCSB sometimes returns "X-RAY DIFFRACTION" / "ELECTRON MICROSCOPY"
  return value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Header({ metadata, loading, error, onRetry }: HeaderProps) {
  const title = "Mu Opioid Receptor";
  const subtitle = "Active state, agonist-bound · class A GPCR";

  return (
    <header className="page-header">
      <div className="page-header-titles">
        <p className="eyebrow">Interactive molecular visualisation</p>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>

      <div className="page-header-meta">
        {error ? (
          <div className="meta-card meta-error" role="status">
            <span className="meta-label">Metadata</span>
            <span className="meta-value">RCSB unreachable — showing cached values</span>
            {onRetry && (
              <button
                type="button"
                className="ghost-button"
                style={{ marginTop: 8, width: "100%" }}
                onClick={onRetry}
                aria-label="Retry fetching metadata"
              >
                Retry
              </button>
            )}
          </div>
        ) : loading ? (
          <div className="meta-card" aria-busy="true">
            <span className="meta-label">Loading</span>
            <span className="meta-value">Fetching entry…</span>
          </div>
        ) : metadata ? (
          <>
            <div className="meta-card">
              <span className="meta-label">PDB</span>
              <a
                className="meta-value meta-link"
                href={`https://www.rcsb.org/structure/${metadata.rcsbId}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {metadata.rcsbId}
              </a>
            </div>
            <div className="meta-card">
              <span className="meta-label">Resolution</span>
              <span className="meta-value">{formatResolution(metadata.resolution)}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Method</span>
              <span className="meta-value">{formatMethod(metadata.method)}</span>
            </div>
            <div className="meta-card">
              <span className="meta-label">Released</span>
              <span className="meta-value">{metadata.releaseYear ?? "—"}</span>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
