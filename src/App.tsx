import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Viewer } from "./components/Viewer";
import { POCKET_RESIDUES, type PocketResidue } from "./data/residues";
import { BU72 } from "./data/ligand";
import { fetchEntryMetadata, type EntryMetadata } from "./lib/rcsb";
import "./styles/theme.css";
import "./styles/app.css";

const PDB_ID = "5C1M";

function residueKey(residue: PocketResidue): string {
  return `${residue.authAsymId}-${residue.residue}`;
}

export default function App() {
  const [metadata, setMetadata] = useState<EntryMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [selectedResidue, setSelectedResidue] = useState<PocketResidue | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [viewerReady, setViewerReady] = useState(false);
  const [ligandOnlyActive, setLigandOnlyActive] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<"overview" | "pocket" | "ligand">("overview");

  // Fetch RCSB metadata on mount. The viewer does not block on this.
  useEffect(() => {
    const controller = new AbortController();
    fetchEntryMetadata(PDB_ID, controller.signal)
      .then((data) => {
        setMetadata(data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : String(err);
        setMetadataError(message);
        console.warn("RCSB metadata fetch failed:", message);
      });
    return () => controller.abort();
  }, []);

  const handleSelect = (residue: PocketResidue | null) => {
    setSelectedResidue(residue);
  };

  const handleReset = () => {
    setResetSignal((n) => n + 1);
  };

  const handleToggleLigandOnly = (active: boolean) => {
    setLigandOnlyActive(active);
  };

  const handleCameraPresetChange = (preset: "overview" | "pocket" | "ligand") => {
    setCameraPreset(preset);
  };

  const handleRetryMetadata = () => {
    setMetadataError(null);
    setMetadata(null);
    const controller = new AbortController();
    fetchEntryMetadata(PDB_ID, controller.signal)
      .then((data) => setMetadata(data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setMetadataError(message);
      });
  };

  return (
    <div className="app">
      <Header
        metadata={metadata}
        loading={!metadata && !metadataError}
        error={metadataError}
        onRetry={handleRetryMetadata}
      />
      <main className="app-main">
        <div className="viewer-shell">
          <Viewer
            pdbId={PDB_ID}
            selectedResidue={selectedResidue}
            resetSignal={resetSignal}
            cameraPreset={cameraPreset}
            onSelectResidue={handleSelect}
            onReady={() => setViewerReady(true)}
            ligandOnlyActive={ligandOnlyActive}
          />
          <p className="viewer-hint" aria-hidden={!viewerReady}>
            <span className="dot" /> Drag to orbit · scroll to zoom · click a residue in the
            sidebar to focus the pocket.
          </p>
        </div>
        <Sidebar
          ligand={BU72}
          residues={POCKET_RESIDUES}
          activeResidueKey={selectedResidue ? residueKey(selectedResidue) : null}
          cameraPreset={cameraPreset}
          onSelectResidue={handleSelect}
          onResetView={handleReset}
          onCameraPresetChange={handleCameraPresetChange}
          onToggleLigandOnly={handleToggleLigandOnly}
          ligandOnlyActive={ligandOnlyActive}
        />
      </main>
      <footer className="page-footer">
        <p>
          Structure data from{" "}
          <a
            href="https://www.rcsb.org/structure/5C1M"
            target="_blank"
            rel="noreferrer noopener"
          >
            RCSB PDB
          </a>{" "}
          (Manglik et al., <em>Nature</em> 2012). Rendered with{" "}
          <a
            href="https://molstar.org/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Mol*
          </a>{" "}
          via{" "}
          <a
            href="https://github.com/molstar/pdbe-molstar"
            target="_blank"
            rel="noreferrer noopener"
          >
            PDBe Molstar
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
