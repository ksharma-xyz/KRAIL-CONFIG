// scripts/generate-openapi.js

const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");
const convert = require("@openapi-contrib/json-schema-to-openapi-schema").default;
const YAML = require("yaml");

(async () => {
  const schemaFiles = await glob("src/**/*.schema.json");

  const components = {
    schemas: {},
  };

  for (const file of schemaFiles) {
    const name = path.basename(file, ".schema.json");
    const raw = fs.readFileSync(file, "utf8");
    const jsonSchema = JSON.parse(raw);

    try {
      const openapiSchema = await convert(jsonSchema);
      components.schemas[name] = openapiSchema;
    } catch (e) {
      console.error(`❌ Failed to convert ${file}:`, e.message);
    }
  }

  const openapi = {
    openapi: "3.0.3",
    info: {
      title: "KRAIL Schema API",
      version: "1.0.0",
    },
    paths: {},
    components,
  };

  // Output to both YAML and JSON under docs/
  const outputDir = path.resolve("docs");
  fs.mkdirSync(outputDir, { recursive: true });

  const yamlOutput = YAML.stringify(openapi);
  fs.writeFileSync(path.join(outputDir, "openapi.yaml"), yamlOutput);

  fs.writeFileSync(path.join(outputDir, "openapi.json"), JSON.stringify(openapi, null, 2));

  console.log("✅ openapi.yaml and openapi.json generated in docs/");
})();
