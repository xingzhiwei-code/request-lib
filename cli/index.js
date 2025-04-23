#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function generateTemplate(apiSpecPath, outputDir) {
  const spec = JSON.parse(await fs.readFile(apiSpecPath, 'utf-8'));
  const endpoints = spec.endpoints;

  for (const [moduleName, moduleEndpoints] of Object.entries(endpoints)) {
    let output = `// ${moduleName}.ts\n\nimport { createIdempotentRequest, useRequestor } from '@xingzhiwei/request-lib';\n\n`;
    
    for (const [endpointName, endpoint] of Object.entries(moduleEndpoints)) {
      const { path, method, description, idempotent } = endpoint;
      const functionName = endpointName;
      const isGet = method.toUpperCase() === 'GET';
      const requestMethod = isGet ? 'get' : 'post';
      const paramsStr = isGet ? 'params: { page, size }' : 'data';
      const inputParams = isGet ? '(page: number, size: number)' : '(data: any)';

      output += `/**\n * ${description}\n */\n`;
      output += `export const ${functionName} = (() => {\n`;
      if (idempotent) {
        output += `  const req = createIdempotentRequest();\n`;
      } else {
        output += `  const req = useRequestor();\n`;
      }
      output += `  return async ${inputParams} => {\n`;
      output += `    return req.${requestMethod}('${path}', { ${paramsStr} }).then(resp => resp.json());\n`;
      output += `  };\n`;
      output += `})();\n\n`;
    }

    const outputPath = path.join(outputDir, `${moduleName}.ts`);
    await fs.writeFile(outputPath, output);
    console.log(`Generated ${outputPath}`);
  }
}

const [, , apiSpecPath, outputDir = './src/request-bus'] = process.argv;

if (!apiSpecPath) {
  console.error('Please provide the path to the API specification JSON file.');
  process.exit(1);
}

generateTemplate(apiSpecPath, outputDir).catch(err => {
  console.error('Error generating templates:', err);
  process.exit(1);
});