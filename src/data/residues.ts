export interface PocketResidue {
  /** Ballesteros–Weinstein superscript (e.g. "3.32") */
  bw: string;
  /** One-letter amino acid + sequence number, e.g. "D147" */
  residue: string;
  /** Author chain id in the 5C1M asymmetric unit */
  authAsymId: string;
  /** Functional role in ligand recognition / receptor activation */
  role: string;
  /** Interaction with BU72 */
  interaction: string;
}

export const POCKET_RESIDUES: PocketResidue[] = [
  {
    bw: "3.32",
    residue: "D147",
    authAsymId: "A",
    role: "Conserved anchor of the orthosteric pocket",
    interaction: "Salt bridge with the protonated tertiary amine of BU72",
  },
  {
    bw: "5.42",
    residue: "I219",
    authAsymId: "A",
    role: "Hydrophobic floor of the binding pocket",
    interaction: "Van der Waals contact with BU72 aromatic ring",
  },
  {
    bw: "6.54",
    residue: "I296",
    authAsymId: "A",
    role: "Transmembrane helix 6 contact",
    interaction: "Packs against the morphinan scaffold of BU72",
  },
  {
    bw: "6.55",
    residue: "H297",
    authAsymId: "A",
    role: "Conserved toggle switch residue",
    interaction: "π-stacking / polar contact with BU72; rotamer shift couples agonist binding to helix-6 movement",
  },
  {
    bw: "7.35",
    residue: "W318",
    authAsymId: "A",
    role: "Aromatic ceiling of the pocket",
    interaction: "Edge-to-face π-interaction with the BU72 phenol",
  },
  {
    bw: "7.43",
    residue: "Y326",
    authAsymId: "A",
    role: "Polar contact / activation relay",
    interaction: "Hydrogen bond to BU72 phenol; conformation change propagates to NPxxY motif",
  },
  {
    bw: "ECL2",
    residue: "E310",
    authAsymId: "A",
    role: "Extracellular loop 2 cap",
    interaction: "Hydrogen bond with the BU72 basic nitrogen and amide",
  },
];
