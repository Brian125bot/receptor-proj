import { useEffect, useRef, useState } from "react";
import { Loader } from "./Loader";
import {
  applyHeroPreset,
  awaitInstance,
  awaitLoadComplete,
  focusResidue,
  resetView,
  focusPocket,
  focusLigand,
  toggleLigandOnly,
  setHighlightColor,
  type MolstarInstance,
  type PdbeMolstarElement,
} from "../lib/molstar";
import type { PocketResidue } from "../data/residues";

type CameraPreset = "overview" | "pocket" | "ligand";

interface ViewerProps {
  pdbId: string;
  selectedResidue: PocketResidue | null;
  resetSignal: number;
  cameraPreset: CameraPreset;
  onSelectResidue(residue: PocketResidue | null): void;
  onReady(): void;
  ligandOnlyActive?: boolean;
}

type Status = "loading" | "ready" | "error";

const PDB_ATTRIBUTES = {
  "hide-controls": true,
  "hide-water": true,
  "hide-polymer": false,
  "hide-het": false,
  "hide-non-standard": true,
  "hide-carbs": true,
  "hide-coarse": true,
  "load-maps": false,
  "select-interaction": true,
  "subscribe-events": true,
  "pdbe-link": false,
  "hide-expand-icon": true,
  "hide-selection-icon": true,
  "hide-animation-icon": true,
  "hide-control-toggle-icon": true,
  "hide-control-info-icon": true,
  "loading-overlay": false,
  encoding: "cif" as const,
  "bg-color-r": 18,
  "bg-color-g": 18,
  "bg-color-b": 26,
  lighting: "default",
  "visual-style": "cartoon",
};

export function Viewer({
  pdbId,
  selectedResidue,
  resetSignal,
  cameraPreset,
  onSelectResidue,
  onReady,
  ligandOnlyActive = false,
}: ViewerProps) {
  const elementRef = useRef<PdbeMolstarElement | null>(null);
  const instanceRef = useRef<MolstarInstance | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Boot the viewer once the custom element is upgraded by the browser.
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let cancelled = false;

    // Custom elements are upgraded asynchronously; wait until `instance` is set.
    const waitAndBoot = async () => {
      try {
        const instance = await awaitInstance(el);
        if (cancelled) return;
        instanceRef.current = instance;
        await awaitLoadComplete(instance);
        if (cancelled) return;
        await applyHeroPreset(el, instance);
        if (cancelled) return;
        setStatus("ready");
        onReady();
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    };

    void waitAndBoot();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to residue selection.
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || status !== "ready") return;
    if (selectedResidue) {
      void focusResidue(instance, selectedResidue).catch((err: unknown) => {
        console.error("focusResidue failed", err);
      });
    }
  }, [selectedResidue, status]);

  // React to reset signal from the parent.
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || status !== "ready" || resetSignal === 0) return;
    onSelectResidue(null);
    void resetView(instance).catch((err: unknown) => {
      console.error("resetView failed", err);
    });
  }, [resetSignal, status, onSelectResidue]);

  // React to camera preset change.
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || status !== "ready") return;
    const apply = async () => {
      if (cameraPreset === "pocket") {
        await focusPocket(instance).catch((err: unknown) => {
          console.error("focusPocket failed", err);
        });
      } else if (cameraPreset === "ligand") {
        await focusLigand(instance).catch((err: unknown) => {
          console.error("focusLigand failed", err);
        });
      } else {
        await resetView(instance).catch((err: unknown) => {
          console.error("resetView failed", err);
        });
      }
    };
    void apply();
  }, [cameraPreset, status]);

  // React to ligand-only toggle.
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || status !== "ready") return;
    void toggleLigandOnly(instance, ligandOnlyActive).catch((err: unknown) => {
      console.error("toggleLigandOnly failed", err);
    });
    void setHighlightColor(instance, ligandOnlyActive).catch((err: unknown) => {
      console.error("setHighlightColor failed", err);
    });
  }, [ligandOnlyActive, status]);

  return (
    <div className="viewer" data-status={status}>
      <pdbe-molstar
        ref={elementRef}
        class="viewer-mount"
        custom-data-url={`https://files.rcsb.org/download/${pdbId}.cif`}
        custom-data-format="cif"
        custom-data-binary="false"
        {...PDB_ATTRIBUTES}
      />
      {status !== "ready" && (
        <div className="viewer-overlay" role="presentation">
          {status === "loading" && <Loader pdbId={pdbId} />}
          {status === "error" && (
            <div className="viewer-error" role="alert">
              <p className="viewer-error-title">Failed to load viewer</p>
              <p className="viewer-error-message">
                {errorMessage ?? "Unknown error."}
              </p>
              <p className="viewer-error-hint">
                The Mol* script is loaded from{" "}
                <a
                  href="https://cdn.jsdelivr.net/npm/pdbe-molstar@3.12.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  jsdelivr
                </a>
                . Check your network connection or try reloading.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
