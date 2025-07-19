# KRAIL Config Schema Docs

This repository contains JSON schemas for KRAIL app configuration and a workflow to generate OpenAPI specification
documentation from those schemas.

https://ksharma-xyz.github.io/KRAIL-CONFIG/

---

## Approach

- Convert JSON Schema to OpenAPI.
- Generate static HTML docs (using Redoc CLI).
- Deploy to GitHub Pages (via GitHub Actions).

## Validating YAML

To validate the OpenAPI YAML file, you can use the Redocly CLI tool. First, install it globally if you haven't already:

```bash
npm install -g @redocly/cli
```

Then, run the following command to lint the OpenAPI spec:

```bash

`redocly lint docs/openapi.yaml`
````

## What’s in this repo?

- `src/` — Folder containing JSON schema files (`*.schema.json`) describing configuration data.
- `scripts/generate-openapi.cjs` — Node.js script that converts JSON schemas into a combined OpenAPI 3.0 spec (
  `openapi.yaml` and `openapi.json`).
- `docs/` — Folder containing generated OpenAPI specs and documentation assets (served by GitHub Pages).
- `.github/workflows/generate-openapi.yml` — GitHub Actions workflow to automatically regenerate and commit the OpenAPI
  spec on schema changes.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v16 or higher recommended)
- `npm` (comes with Node.js)
- Git

---

### Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/yourusername/KRAIL-CONFIG.git
cd KRAIL-CONFIG
npm install
```

## Generating OpenAPI docs locally

To generate the OpenAPI spec files (openapi.yaml and openapi.json) from all JSON schemas:

```bash
npm run generate:openapi
```

This will:

- Read all .schema.json files under src/
- Convert them to OpenAPI schema components
- Output openapi.yaml and openapi.json files inside the docs/ folder

## Viewing the documentation

The generated OpenAPI spec can be visualized using:

- Swagger Editor: Paste the contents of docs/openapi.yaml or docs/openapi.json.
- Local Swagger UI or Redoc server.
- GitHub Pages, if you have the docs/ folder configured as your GitHub Pages source.

## Automating generation on push

The GitHub Actions workflow .github/workflows/generate-openapi.yml automatically:

- Runs on pushes to the main branch.
- Regenerates openapi.yaml and openapi.json whenever JSON schema files or the generator script changes.
- Commits and pushes updated OpenAPI specs to the docs/ folder.

This keeps the OpenAPI docs up to date with minimal manual work.

## Customization

Add or remove JSON schemas in the src/ folder to modify the API schema.

## Development Tips

- Keep your JSON schema files under src/ with a .schema.json extension.
- Use JSON Schema Draft-07 compatible syntax.
- Run npm run generate:openapi after schema edits to preview changes locally before pushing.

## Troubleshooting

- If you get missing module errors (yaml, fast-glob, etc.), run:

```bash
npm install
```

- Ensure node_modules/ is in .gitignore and not committed.
- If GitHub Pages fails to serve docs, confirm your repository’s Pages source is set to the /docs folder.

## License

This project is licensed under the Apache License. See `LICENSE` file for more details.

---

## Contact

If you have any questions or feedback, feel free to raise an issue or reach out to the maintainers.

Email: hey@krail.app
