import type { Ligand } from "../data/ligand";
import type { PocketResidue } from "../data/residues";
import { ResidueCard } from "./ResidueCard";

type CameraPreset = "overview" | "pocket" | "ligand";

interface SidebarProps {
  ligand: Ligand;
  residues: PocketResidue[];
  activeResidueKey: string | null;
  cameraPreset: CameraPreset;
  onSelectResidue(residue: PocketResidue): void;
  onResetView(): void;
  onCameraPresetChange(preset: CameraPreset): void;
  onToggleLigandOnly(active: boolean): void;
  ligandOnlyActive?: boolean;
}

export function Sidebar({
  ligand,
  residues,
  activeResidueKey,
  cameraPreset,
  onSelectResidue,
  onResetView,
  onCameraPresetChange,
  onToggleLigandOnly,
  ligandOnlyActive = false,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <header className="sidebar-section-head">
          <h2>Bound ligand</h2>
          <div className="sidebar-controls">
            <button
              type="button"
              className="ghost-button"
              onClick={() => onToggleLigandOnly(!ligandOnlyActive)}
              aria-pressed={ligandOnlyActive}
              aria-label={ligandOnlyActive ? "Show full structure" : "Show ligand only"}
            >
              {ligandOnlyActive ? "Full view" : "Ligand only"}
            </button>
            <button type="button" className="ghost-button" onClick={onResetView} aria-label="Reset view">
              Reset
            </button>
          </div>
        </header>
        <article className="ligand-card">
          <div className="ligand-card-row">
            <span className="ligand-name">{ligand.name}</span>
            <span className="ligand-class">{ligand.class}</span>
          </div>
          <dl className="ligand-meta">
            <div>
              <dt>Formula</dt>
              <dd>{ligand.formula}</dd>
            </div>
            <div>
              <dt>Molecular weight</dt>
              <dd>{ligand.molecularWeight.toFixed(1)} g·mol⁻¹</dd>
            </div>
            <div>
              <dt>Chain</dt>
              <dd>{ligand.chain}</dd>
            </div>
          </dl>
          <p className="ligand-note">{ligand.note}</p>
        </article>
        <div className="ligand-card camera-presets" role="group" aria-label="Camera presets">
          <p className="meta-label">Camera</p>
          <div className="camera-preset-row">
            <button
              type="button"
              className={`ghost-button${cameraPreset === "overview" ? " is-active" : ""}`}
              aria-pressed={cameraPreset === "overview"}
              onClick={() => onCameraPresetChange("overview")}
            >
              Overview
            </button>
            <button
              type="button"
              className={`ghost-button${cameraPreset === "pocket" ? " is-active" : ""}`}
              aria-pressed={cameraPreset === "pocket"}
              onClick={() => onCameraPresetChange("pocket")}
            >
              Pocket
            </button>
            <button
              type="button"
              className={`ghost-button${cameraPreset === "ligand" ? " is-active" : ""}`}
              aria-pressed={cameraPreset === "ligand"}
              onClick={() => onCameraPresetChange("ligand")}
            >
              Ligand
            </button>
          </div>
        </div>
      </section>

      <section className="sidebar-section">
        <header className="sidebar-section-head">
          <h2>Orthosteric pocket</h2>
          <span className="sidebar-section-count">{residues.length} residues</span>
        </header>
        <p className="sidebar-section-blurb">
          Click a residue to focus the camera on it. The{" "}
          <span className="residue-bw residue-bw--inline">BW</span> notation is
          Ballesteros–Weinstein numbering for class A GPCRs.
        </p>
        <ul className="residue-list">
          {residues.map((residue) => (
            <ResidueCard
              key={`${residue.authAsymId}-${residue.residue}`}
              residue={residue}
              active={
                activeResidueKey === `${residue.authAsymId}-${residue.residue}`
              }
              onSelect={onSelectResidue}
            />
          ))}
        </ul>
      </section>
    </aside>
  );
}
