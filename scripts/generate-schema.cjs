const fs = require('fs');
const path = require('path');

function generateSchemaFromJson(jsonData, title) {
  const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": title,
    "description": `Schema for ${title.toLowerCase()}`,
    "properties": {},
    "required": [],
    "additionalProperties": false
  };

  function inferType(value) {
    if (Array.isArray(value)) {
      return {
        "type": "array",
        "items": value.length > 0 ? inferType(value[0]) : { "type": "string" }
      };
    } else if (typeof value === 'object' && value !== null) {
      const properties = {};
      const required = [];
      for (const [key, val] of Object.entries(value)) {
        properties[key] = inferType(val);
        required.push(key);
      }
      return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": false
      };
    } else if (typeof value === 'string') {
      return { "type": "string" };
    } else if (typeof value === 'number') {
      return Number.isInteger(value) ? { "type": "integer" } : { "type": "number" };
    } else if (typeof value === 'boolean') {
      return { "type": "boolean" };
    }
    return { "type": "string" };
  }

  for (const [key, value] of Object.entries(jsonData)) {
    schema.properties[key] = inferType(value);
    schema.required.push(key);
  }

  return schema;
}

// Find all JSON files and generate schemas
const srcDir = 'src';
function findJsonFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (item.endsWith('.json') && !item.endsWith('.schema.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

const jsonFiles = findJsonFiles(srcDir);

for (const jsonFile of jsonFiles) {
  const schemaFile = jsonFile.replace('.json', '.schema.json');

  if (!fs.existsSync(schemaFile)) {
    console.log(`Generating schema for ${jsonFile}`);

    const jsonData = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    const title = path.basename(jsonFile, '.json').replace(/^./, c => c.toUpperCase());
    const schema = generateSchemaFromJson(jsonData, title);

    fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));
    console.log(`Generated ${schemaFile}`);
  }
}
