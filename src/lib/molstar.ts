import type { PocketResidue } from "../data/residues";

/**
 * Subset of the pdbe-molstar web-component instance API we rely on.
 * Typed loosely to avoid coupling to package internals; methods are
 * documented in the wiki at https://github.com/molstar/pdbe-molstar/wiki/3.-Helper-Methods
 */
export interface MolstarInstance {
  canvas: {
    setBgColor(color: { r: number; g: number; b: number }): Promise<void>;
  };
  visual: {
    visibility(opts: {
      polymer?: boolean;
      het?: boolean;
      water?: boolean;
      carbs?: boolean;
      nonStandard?: boolean;
      maps?: boolean;
    }): Promise<void>;
    focus(
      selection: Array<{
        auth_asym_id?: string;
        auth_seq_id?: number;
        entity_id?: string;
        struct_asym_id?: string;
        start_residue_number?: number;
        end_residue_number?: number;
      }>,
      structureNumberOrId?: number | string,
    ): Promise<void>;
    highlight(params: {
      data: Array<{
        auth_asym_id?: string;
        auth_seq_id?: number;
        color?: { r: number; g: number; b: number };
        focus?: boolean;
      }>;
      color?: { r: number; g: number; b: number };
      focus?: boolean;
    }): Promise<void>;
    clearHighlight(): Promise<void>;
    setColor(params: { highlight?: { r: number; g: number; b: number } }): Promise<void>;
  };
  events: {
    loadComplete: { subscribe(cb: () => void): void };
  };
}

/** The pdbe-molstar custom element has these accessors in addition to its attributes. */
export interface PdbeMolstarElement extends HTMLElement {
  moleculeId?: string;
  hideControls?: boolean;
  hideWater?: boolean;
  hidePolymer?: boolean;
  hideHet?: boolean;
  visualStyle?: string;
  lighting?: string;
  bgColorR?: number;
  bgColorG?: number;
  bgColorB?: number;
  loadMaps?: boolean;
  selectInteraction?: boolean;
  subscribeEvents?: boolean;
  hideExpandIcon?: boolean;
  hideSelectionIcon?: boolean;
  hideAnimationIcon?: boolean;
  hideControlToggleIcon?: boolean;
  hideControlInfoIcon?: boolean;
  pdbeLink?: boolean;
  encoding?: "bcif" | "cif" | "pdb";
  // v3.x: instance renamed to viewerInstance
  viewerInstance?: MolstarInstance;
  // legacy alias used by older versions
  instance?: MolstarInstance;
  plugin?: {
    canvas3d?: {
      setPixelScale?: (scale: number) => void;
    };
  };
}

function getInstance(el: PdbeMolstarElement): MolstarInstance | undefined {
  return el.viewerInstance ?? el.instance;
}

/** Resolve the <pdbe-molstar> element's plugin instance once it has loaded. */
export function awaitInstance(
  el: PdbeMolstarElement,
  timeoutMs = 60_000,
): Promise<MolstarInstance> {
  return new Promise((resolve, reject) => {
    const existing = getInstance(el);
    if (existing) {
      resolve(existing);
      return;
    }
    const start = performance.now();
    const tick = () => {
      const inst = getInstance(el);
      if (inst) {
        resolve(inst);
        return;
      }
      if (performance.now() - start > timeoutMs) {
        reject(new Error("pdbe-molstar instance did not become available"));
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

/** Wait until the structure has finished loading. */
export function awaitLoadComplete(
  instance: MolstarInstance,
  timeoutMs = 90_000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const timer = window.setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error("loadComplete did not fire in time"));
    }, timeoutMs);
    // loadComplete is a BehaviorSubject in pdbe-molstar; subscribe fires
    // immediately if the value is already present, then again on each load.
    instance.events.loadComplete.subscribe(() => {
      window.clearTimeout(timer);
      finish();
    });
  });
}

const HIGHLIGHT = { r: 0xd4, g: 0xaf, b: 0x37 } as const;

export async function applyHeroPreset(
  el: PdbeMolstarElement,
  instance: MolstarInstance,
): Promise<void> {
  // Background: near-black with a hint of blue.
  await instance.canvas.setBgColor({ r: 0x12, g: 0x12, b: 0x1a });

  // Visual toggles via instance — covers edge cases attributes don't.
  await instance.visual.visibility({
    polymer: true,
    het: true,
    water: false, // 5C1M has 94 waters; hide them.
    carbs: false,
    nonStandard: false,
    maps: false,
  });

  // Highlight colour: warm gold so residues pop against the dark background.
  await instance.visual.setColor({ highlight: HIGHLIGHT });

  // Cap device pixel ratio so phones don't render at 3×.
  el.plugin?.canvas3d?.setPixelScale?.(Math.min(window.devicePixelRatio || 1, 2));
}

const RESIDUE_REGEX = /^([A-Z])(\d+)([A-Z]?)$/;

function parseResidue(residue: string): { aa: string; seq: number } | null {
  const m = RESIDUE_REGEX.exec(residue.trim());
  if (!m) return null;
  return { aa: m[1], seq: Number(m[2]) };
}

export async function focusResidue(
  instance: MolstarInstance,
  residue: PocketResidue,
): Promise<void> {
  const parsed = parseResidue(residue.residue);
  if (!parsed) return;
  await instance.visual.clearHighlight();
  await instance.visual.highlight({
    data: [
      {
        auth_asym_id: residue.authAsymId,
        auth_seq_id: parsed.seq,
        color: HIGHLIGHT,
        focus: true,
      },
    ],
    color: HIGHLIGHT,
    focus: true,
  });
}

const LIGAND_HIGHLIGHT = { r: 0xe8, g: 0x9b, b: 0x6c } as const;

export async function setHighlightColor(
  instance: MolstarInstance,
  active: boolean,
): Promise<void> {
  await instance.visual.setColor({
    highlight: active ? LIGAND_HIGHLIGHT : HIGHLIGHT,
  });
}

export async function toggleLigandOnly(
  instance: MolstarInstance,
  active: boolean,
): Promise<void> {
  await instance.visual.visibility({
    polymer: !active,
    het: active,
    water: false,
    carbs: false,
    nonStandard: false,
    maps: false,
  });
  await instance.visual.setColor({
    highlight: active ? LIGAND_HIGHLIGHT : HIGHLIGHT,
  });
}

export async function resetView(
  instance: MolstarInstance,
): Promise<void> {
  await instance.visual.clearHighlight();
  // Re-focus on the whole structure by reloading with a fresh selection that
  // spans the full asymmetric unit. Easiest portable path: focus on the
  // receptor chain using a wide residue range — chain A in 5C1M is residues ~40–400.
  await instance.visual.focus(
    [
      {
        auth_asym_id: "A",
        start_residue_number: 1,
        end_residue_number: 1000,
      },
    ],
    "main",
  );
}

export async function focusPocket(
  instance: MolstarInstance,
): Promise<void> {
  // Center on the orthosteric pocket by focusing on a residue range that
  // spans the pocket (residues ~140–330 in 5C1M chain A).
  await instance.visual.focus(
    [
      {
        auth_asym_id: "A",
        start_residue_number: 140,
        end_residue_number: 330,
      },
    ],
    "main",
  );
}

export async function focusLigand(
  instance: MolstarInstance,
): Promise<void> {
  await instance.visual.focus(
    [
      {
        auth_asym_id: "I",
        start_residue_number: 1,
        end_residue_number: 9999,
      },
    ],
    "main",
  );
}
