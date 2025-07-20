const fs = require("fs");
const path = require("path");
const glob = require("fast-glob");
const convert = require("@openapi-contrib/json-schema-to-openapi-schema").default;
const YAML = require("yaml");

(async () => {
  const schemaFiles = await glob("src/**/*.json");
  const components = { schemas: {} };
  const schemaNames = [];
  const paths = {};

  for (const file of schemaFiles) {
    const relativePath = path.relative("src", file);
    const folderName = path.dirname(relativePath);
    const name = folderName === "." ? path.basename(file, ".json") : folderName;

    schemaNames.push(name);
    const raw = fs.readFileSync(file, "utf8");
    const jsonSchema = JSON.parse(raw);

    try {
      const openapiSchema = await convert(jsonSchema);
      const cleanSchema = { ...openapiSchema };
      const examples = {};

      Object.keys(cleanSchema).forEach(key => {
        if (key.startsWith('x-')) {
          const exampleKey = key.replace('x-', '');
          examples[exampleKey] = cleanSchema[key];
          delete cleanSchema[key];
        }
      });

      if (Object.keys(examples).length > 0) {
        components.schemas[name] = {
          type: 'object',
          description: `Schema for ${name}`,
          example: examples, // Changed from 'examples' to 'example'
          properties: {
            ...(examples.confirmedDates && {
              confirmedDates: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    month: { type: 'integer' },
                    day: { type: 'integer' },
                    emojiList: { type: 'array', items: { type: 'string' } },
                    greeting: { type: 'string' }
                  }
                }
              }
            }),
            ...(examples.variableDates && {
              variableDates: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    startDate: { type: 'string', format: 'date' },
                    endDate: { type: 'string', format: 'date' },
                    emojiList: { type: 'array', items: { type: 'string' } },
                    greeting: { type: 'string' }
                  }
                }
              }
            }),
            ...(examples.noticeList && {
              noticeList: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    imageUrl: { type: 'string', format: 'uri' },
                    buttons: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          text: { type: 'string' },
                          url: { type: 'string', format: 'uri' }
                        }
                      }
                    }
                  }
                }
              }
            })
          }
        };
      } else {
        components.schemas[name] = cleanSchema;
      }

      paths[`/${name}`] = {
        get: {
          summary: `Get ${name} schema`,
          description: `Retrieve the ${name} schema with structure and examples`,
          operationId: `get${name.charAt(0).toUpperCase() + name.slice(1)}`,
          security: [], // Added security (empty array means no auth required)
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
      console.error(`❌ Failed to convert ${file}:`, e.message);
    }
  }

  paths["/schemas"] = {
    get: {
      summary: "List all schemas",
      description: "Retrieve all available schemas with their structure and examples",
      operationId: "listAllSchemas",
      security: [], // Added security
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
      license: { // Added license field
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