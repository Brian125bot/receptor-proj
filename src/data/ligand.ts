export interface Ligand {
  id: string;
  name: string;
  class: string;
  formula: string;
  molecularWeight: number;
  pdbId: string;
  chain: string;
  note: string;
}

export const BU72: Ligand = {
  id: "BU72",
  name: "BU72",
  class: "Morphinan agonist",
  formula: "C₂₈H₃₅N₃O₂",
  molecularWeight: 445.6,
  pdbId: "5C1M",
  chain: "I",
  note: "High-affinity μOR agonist co-crystallised in the orthosteric pocket; stabilises the active-state conformation captured here.",
};
