const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");
const convert = require("@openapi-contrib/json-schema-to-openapi-schema").default;
const YAML = require("yaml");

(async () => {
  // Match all .json files under src/
  const schemaFiles = await glob("src/**/*.json");
  const components = { schemas: {} };
  const schemaNames = [];

  for (const file of schemaFiles) {
    const name = path.basename(file, ".json");
    schemaNames.push(name);
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
      title: "KRAIL-CONFIG Schema API",
      version: "1.0.0",
    },
    paths: {
      "/schemas": {
        get: {
          summary: "List all schemas",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: Object.fromEntries(
                      schemaNames.map(name => [
                        name,
                        { $ref: `#/components/schemas/${name}` }
                      ])
                    )
                  }
                }
              }
            }
          }
        }
      }
    },
    components,
  };

  fs.writeFileSync("openapi.yaml", YAML.stringify(openapi));
  fs.writeFileSync("openapi.json", JSON.stringify(openapi, null, 2));

  const outputDir = path.resolve("docs");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "openapi.yaml"), YAML.stringify(openapi));
  fs.writeFileSync(path.join(outputDir, "openapi.json"), JSON.stringify(openapi, null, 2));

  console.log("✅ openapi.yaml and openapi.json generated at root and copied to docs/");
})();
