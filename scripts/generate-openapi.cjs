const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");
const convert = require("@openapi-contrib/json-schema-to-openapi-schema").default;
const YAML = require("yaml");

(async () => {
  // Find all schema files
  const schemaFiles = await glob("src/**/*.schema.json");
  // Find all example data files
  const dataFiles = await glob("src/**/*.json", { ignore: ["**/*.schema.json"] });

  const components = { schemas: {} };
  const schemaNames = [];
  const paths = {};

  for (const schemaFile of schemaFiles) {
    const relativePath = path.relative("src", schemaFile);
    const name = path.basename(schemaFile, ".schema.json");

    schemaNames.push(name);

    try {
      // Read schema definition
      const schemaRaw = fs.readFileSync(schemaFile, "utf8");
      const jsonSchema = JSON.parse(schemaRaw);

      // Convert to OpenAPI schema
      const openapiSchema = await convert(jsonSchema);

      // Look for corresponding data file for examples
      const dataFile = dataFiles.find(file =>
        path.basename(file, ".json") === name
      );

      let example = null;
      if (dataFile) {
        const dataRaw = fs.readFileSync(dataFile, "utf8");
        const data = JSON.parse(dataRaw);

        // Extract examples from x- prefixed properties or use entire data
        const examples = {};
        Object.keys(data).forEach(key => {
          if (key.startsWith('x-')) {
            const exampleKey = key.replace('x-', '');
            examples[exampleKey] = data[key];
          }
        });

        example = Object.keys(examples).length > 0 ? examples : data;
      }

      // Create schema with examples
      components.schemas[name] = {
        ...openapiSchema,
        description: `Schema for ${name}`,
        ...(example && { example })
      };

      // Create API endpoint
      paths[`/${name}`] = {
        get: {
          summary: `Get ${name} schema`,
          description: `Retrieve the ${name} schema with structure and examples`,
          operationId: `get${name.charAt(0).toUpperCase() + name.slice(1)}`,
          security: [],
          responses: {
            "200": {
              description: `Successfully retrieved ${name} schema`,
              content: {
                "application/json": {
                  schema: {
                    $ref: `#/components/schemas/${name}`
                  }
                }
              }
            },
            "400": {
              description: "Bad Request"
            },
            "404": {
              description: "Schema not found"
            }
          }
        }
      };

    } catch (e) {
      console.error(`❌ Failed to process ${schemaFile}:`, e.message);
    }
  }

  // Add schemas listing endpoint
  paths["/schemas"] = {
    get: {
      summary: "List all schemas",
      description: "Retrieve all available schemas with their structure and examples",
      operationId: "listAllSchemas",
      security: [],
      responses: {
        "200": {
          description: "Successfully retrieved all schemas",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: Object.fromEntries(
                  [...new Set(schemaNames)].map(name => [
                    name,
                    { $ref: `#/components/schemas/${name}` }
                  ])
                )
              }
            }
          }
        },
        "400": {
          description: "Bad Request"
        }
      }
    }
  };

  const openapi = {
    openapi: "3.0.3",
    info: {
      title: "KRAIL-CONFIG Schema API",
      version: "1.0.0",
      description: "API for accessing KRAIL-CONFIG schemas including festivals and notices. Each schema type has its own endpoint for better organization.",
      license: {
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0"
      }
    },
    servers: [
      {
        url: "https://api.krail.app",
        description: "Production server"
      }
    ],
    paths,
    components,
  };

  // Write files
  fs.writeFileSync("openapi.yaml", YAML.stringify(openapi));
  fs.writeFileSync("openapi.json", JSON.stringify(openapi, null, 2));

  const outputDir = path.resolve("docs");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "openapi.yaml"), YAML.stringify(openapi));
  fs.writeFileSync(path.join(outputDir, "openapi.json"), JSON.stringify(openapi, null, 2));

  console.log("✅ openapi.yaml and openapi.json generated at root and copied to docs/");
  console.log(`📋 Generated schemas: ${[...new Set(schemaNames)].join(', ')}`);
  console.log(`🔗 Available endpoints: ${Object.keys(paths).join(', ')}`);
})();