import type { PocketResidue } from "../data/residues";

interface ResidueCardProps {
  residue: PocketResidue;
  active: boolean;
  onSelect(residue: PocketResidue): void;
}

export function ResidueCard({ residue, active, onSelect }: ResidueCardProps) {
  return (
    <li>
      <button
        type="button"
        className={`residue-card${active ? " residue-card--active" : ""}`}
        onClick={() => onSelect(residue)}
        aria-pressed={active}
      >
        <div className="residue-card-head">
          <span className="residue-name">{residue.residue}</span>
          <span className="residue-bw">{residue.bw}</span>
        </div>
        <p className="residue-role">{residue.role}</p>
        <p className="residue-interaction">{residue.interaction}</p>
      </button>
    </li>
  );
}
