import { mkdir, writeFile } from "fs/promises";

import openapi from "../openapi.json" assert { type: 'json' };

const targetDirectory = "src/lib/spotify/model";

async function generateSpotifyClient() {
  console.log("\nLaunched generate-spotify-client script");
  console.log('Generating Spotify client from OpenApi spec file...\n')
  await mkdir(targetDirectory, { recursive: true }); // Generate target directory

  const schemas = openapi.components.schemas;
  const typesToGenerate = Object.keys(schemas);

  for (const typeName of typesToGenerate) {
    const typeSchema = schemas[typeName];
    generateType(typeName, typeSchema);
  }
}

function generateType(typeName, typeSchema) {  
  console.log(`Generating type ${typeName}...`);

  const generatedCode = getGeneratedCode(typeName, typeSchema);

  writeFile(`${targetDirectory}/${typeName}.ts`, generatedCode);
}

function getGeneratedType(typeSchema, imports) {
  if (typeSchema.$ref) {
    const refType = typeSchema.$ref.split('/').pop();
    imports.add(refType);
    return refType;
  }

  if (typeSchema.oneOf) {
    return `(${typeSchema.oneOf.map(schema => getGeneratedType(schema, imports)).join(' | ')})`;
  }

  if (typeSchema.allOf) {
    return typeSchema.allOf.map(schema => getGeneratedType(schema, imports)).join(' & ');
  }

  if (typeSchema.type === 'array' && typeSchema.items) {
    return `${getGeneratedType(typeSchema.items, imports)}[]`;
  }

  if (typeSchema.enum) {
    return typeSchema.enum.map(value => `"${value}"`).join(' | ');
  }

  switch (typeSchema.type) {
    case 'integer':
    case 'number':
      return 'number';
    case 'string':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'object':
      if (typeSchema.properties) {
        let propertiesCode = '';
        const required = typeSchema.required || [];
        
        for (const [key, propertySchema] of Object.entries(typeSchema.properties)) {
          const propertyType = getGeneratedType(propertySchema, imports);
          const isRequired = required.includes(key);
          propertiesCode += `  ${key}${isRequired ? '' : '?'}: ${propertyType};\n`;
        }
        return `{\n${propertiesCode}}`;
      }
    default:
      console.log(`Type non pris en charge: ${typeSchema.type}`);
  }
}
 
 function getGeneratedCode(typeName, schema) {
  const imports = new Set();
  const typeCode = getGeneratedType(schema, imports);
  
  const importsCode = Array.from(imports)
    .map(type => `import { ${type} } from "./${type}";`)
    .join('\n');
 
  return `${importsCode ? importsCode + '\n\n' : ''}export type ${typeName} = ${typeCode};`;
 }
generateSpotifyClient();