/**
 * Type augmentation for the <pdbe-molstar> custom element.
 * The element is registered at runtime by the script loaded in index.html.
 * Custom-element attributes are accepted as kebab-case strings.
 */
import "react";
import type { PdbeMolstarElement } from "./lib/molstar";

type PdbeMolstarProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "ref"
> & {
  ref?: React.Ref<PdbeMolstarElement>;
  "molecule-id"?: string;
  "hide-controls"?: boolean;
  "hide-water"?: boolean;
  "hide-polymer"?: boolean;
  "hide-het"?: boolean;
  "hide-non-standard"?: boolean;
  "hide-carbs"?: boolean;
  "hide-coarse"?: boolean;
  "load-maps"?: boolean;
  "select-interaction"?: boolean;
  "subscribe-events"?: boolean;
  "pdbe-link"?: boolean;
  "hide-expand-icon"?: boolean;
  "hide-selection-icon"?: boolean;
  "hide-animation-icon"?: boolean;
  "hide-control-toggle-icon"?: boolean;
  "hide-control-info-icon"?: boolean;
  "loading-overlay"?: boolean;
  encoding?: "bcif" | "cif" | "pdb";
  "bg-color-r"?: number;
  "bg-color-g"?: number;
  "bg-color-b"?: number;
  lighting?: string;
  "visual-style"?: string;
  class?: string;
  "custom-data-url"?: string;
  "custom-data-format"?: "cif" | "pdb" | "bcif";
  "custom-data-binary"?: "true" | "false";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "pdbe-molstar": PdbeMolstarProps;
    }
  }
}
