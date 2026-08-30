import type { Ligand } from "../data/ligand";
import type { PocketResidue } from "../data/residues";
import { ResidueCard } from "./ResidueCard";

interface SidebarProps {
  ligand: Ligand;
  residues: PocketResidue[];
  activeResidueKey: string | null;
  onSelectResidue(residue: PocketResidue): void;
  onResetView(): void;
}

export function Sidebar({
  ligand,
  residues,
  activeResidueKey,
  onSelectResidue,
  onResetView,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <header className="sidebar-section-head">
          <h2>Bound ligand</h2>
          <button type="button" className="ghost-button" onClick={onResetView}>
            Reset view
          </button>
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
