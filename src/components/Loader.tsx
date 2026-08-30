interface LoaderProps {
  pdbId: string;
  message?: string;
}

export function Loader({ pdbId, message = "Streaming structure from RCSB" }: LoaderProps) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-pulse" aria-hidden="true" />
      <div className="loader-text">
        <span className="loader-pdb">{pdbId}</span>
        <span className="loader-message">{message}</span>
      </div>
    </div>
  );
}
