# Mu Opioid Receptor · 3D

A high-fidelity, journal-quality 3D visualisation of the human mu opioid receptor in its agonist-bound active state (PDB [5C1M](https://www.rcsb.org/structure/5C1M)). Single-page Vite + React app, deployed statically to Vercel.

## What you're looking at

- **Receptor:** μ-opioid receptor (MOP / OPRM1) — class A GPCR
- **State:** active, stabilised by the G-protein-mimetic nanobody Nb39
- **Agonist:** BU72, a high-affinity morphinan, bound in the orthosteric pocket
- **Resolution:** 2.07 Å X-ray (Manglik et al., *Nature* 2012)

Click any residue in the right-hand sidebar to focus the camera on it and highlight it in the structure. The numbers after each residue are Ballesteros–Weinstein indices for class A GPCRs.

## Stack

- **Build:** Vite + React + TypeScript
- **Renderer:** [Mol\*](https://molstar.org/) via [PDBe Molstar](https://github.com/molstar/pdbe-molstar) `v3.12.0` web component
- **Data:** Live fetch of `5C1M.bcif` from [RCSB PDB](https://files.rcsb.org/download/5C1M.bcif); metadata from the [RCSB GraphQL API](https://data.rcsb.org/graphql)
- **Hosting:** Vercel static (`vercel.json` included)

The Mol\* runtime is loaded from the jsdelivr CDN. **Zero protein coordinates are bundled in the deploy** — search the source for `ATOM` and you'll find none.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build & preview

```bash
npm run build
npm run preview
```

## Deploy

```bash
npx vercel              # preview
npx vercel --prod       # production
```

## Important: do not `npm install pdbe-molstar`

The renderer is intentionally loaded from jsdelivr to keep the Vercel bundle small. Installing the npm package defeats the purpose and inflates the deploy. If you ever need a tighter integration with the plugin's JS API (not the web component), refactor `src/lib/molstar.ts` first and verify the bundle impact with `npm run build && du -sh dist/`.

## Data attribution

- Structure: RCSB PDB, [5C1M](https://www.rcsb.org/structure/5C1M), Manglik et al., *Nature* 2012 — public domain
- Rendering: Mol\* (Sehnal et al., *Nucleic Acids Research* 2021, MIT) and PDBe Molstar (Apache-2.0)
- Typeface: EB Garamond, Inter, JetBrains Mono — via [Bunny Fonts](https://fonts.bunny.net/) (privacy-respecting)

## License

Application source: MIT.
