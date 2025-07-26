# KRAIL Config Schema Docs

This repository contains JSON schemas for KRAIL app configuration and a workflow to generate OpenAPI specification
documentation from those schemas.

https://ksharma-xyz.github.io/KRAIL-CONFIG/

---

## How to add new configuration schema?

### Step-by-Step Process

After adding a new JSON file to the `src/` folder (e.g., `src/park_ride_facilities.json`), follow these steps:

1. Generate the corresponding schema file

```bash
node scripts/generate-schema.cjs
```

Why: This script automatically creates a .schema.json file from your JSON data file. It analyzes the structure and data
types to generate proper validation rules.

2. Generate the OpenAPI specification

`node scripts/generate-openapi.cjs`

Why: This converts all JSON schemas in src/ into a unified OpenAPI 3.0 specification. It creates both docs/openapi.yaml
and docs/openapi.json files that define your API endpoints and data structures.

3. Validate the generated specification

`redocly lint docs/openapi.yaml`

Why: This checks for any syntax errors, missing required fields, or OpenAPI specification violations. It ensures your
documentation will render correctly and follows best practices.

4. Build the documentation (optional for local preview)
   Why: Generates static HTML documentation files using Redoc. This step is optional locally since GitHub Actions will
   do this automatically when you push.

5. Commit and deploy

```
git add .
git commit -m "Add new configuration schema for [your feature]"
git push origin main
```

Why: Pushes your changes to trigger the GitHub Actions workflow, which will automatically regenerate docs and deploy to
GitHub Pages.

### What happens automatically
The GitHub Actions workflow (.github/workflows/schema-docs.yml) will:

- Detect changes to JSON or schema files
- Regenerate the OpenAPI specification
- Build fresh documentation
- Deploy to GitHub Pages at https://ksharma-xyz.github.io/KRAIL-CONFIG/

---

## Quick Setup

### Prerequisites
- Node.js (v16+) and npm
- Git

### Installation


### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v16 or higher recommended)

```bash
git clone https://github.com/yourusername/KRAIL-CONFIG.git
cd KRAIL-CONFIG
npm install
```

#### Redocly CLI Installation

```bash
npm install -g @redocly/cli
```


### Repository Structure

```
src/                 # JSON data and schema files
scripts/             # Generation scripts
docs/                # Generated OpenAPI specs (GitHub Pages)
.github/workflows/   # Auto-deployment workflow
```

---

## License

This project is licensed under the Apache License. See `LICENSE` file for more details.

---

## Contact

If you have any questions or feedback, feel free to raise an issue or reach out to the maintainers.

Email: hey@krail.app
