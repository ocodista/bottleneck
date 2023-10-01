import { parse } from 'espree';
import estraverse from 'estraverse';
import { generate } from 'escodegen';
import { unlinkSync } from "node:fs";

const path = process.argv[2];
const output = process.argv[3] || "output.txt"

const inputFile = Bun.file(path)
const code = await inputFile.text()
let ast = parse(code, getParseOptions());

ast = estraverse.replace(ast, {
  enter: handleNode
});

const measureTimeFunction = `
  let executions = []
  async function measureTime(fn, fnName = 'anonFunction', ...args) {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    const duration = end - start;
    executions.push({ name: fnName, duration })
    return result;
  }
`;

const writeLogFileFunction = parse(`Bun.write(\'${output}\', JSON.stringify(executions));`).body[0];

let iifeFound = false;

// Find the IIFE and add the writeLogFileFunction to its body
estraverse.traverse(ast, {
  enter(node) {
    if (node.type === 'CallExpression' && node.callee.type === 'ArrowFunctionExpression') {
      node.callee.body.body.push(writeLogFileFunction);
      iifeFound = true;
    }
  },
});

if (!iifeFound) {
  ast.body.push(writeLogFileFunction);
}

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const modifiedCode = measureTimeFunction + generate(ast);
await Bun.write("generated.js", modifiedCode)
Bun.spawnSync(["bun", "generated.js"])
const { stdout } = Bun.spawnSync(["bun", join(__dirname, "generateReport.js"), output], { stdio: ['inherit'] })
console.log(stdout.toString());
unlinkSync("generated.js")


function getParseOptions() {
  return {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  };
}

function handleNode(node, parent) {
  if (node.type === 'CallExpression' && node.callee.type !== 'MemberExpression') {
    const functionName = getFunctionName(node);
    if (functionName && !isBuiltInFunction(functionName) && functionName !== 'measureTime') {
      const isAlreadyAwaited = parent.type === 'AwaitExpression';
      const callExpression = {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: 'measureTime',
        },
        arguments: [
          {
            type: 'Identifier',
            name: functionName,
          },
          {
            type: 'Literal',
            value: functionName,
          },
          ...node.arguments,
        ],
      };
      return isAlreadyAwaited ? callExpression : { type: 'AwaitExpression', argument: callExpression };
    }
  } else if (node.type === 'ArrowFunctionExpression' && parent.type === 'CallExpression' && parent.callee.property && parent.callee.property.name === 'get') {
    // This is an Express.js middleware function
    const middlewareFunctionName = parent.arguments[0].value; // The route path
    const callExpression = {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'measureTime',
      },
      arguments: [
        node,
        {
          type: 'Literal',
          value: middlewareFunctionName,
        },
      ],
    };
    return { type: 'AwaitExpression', argument: callExpression };
  }
}
function getFunctionName(node) {
  if (node.callee.type === 'Identifier') {
    return node.callee.name;
  }
  return null;
}

function isBuiltInFunction(functionName) {
  const builtInFunctions = ['setTimeout', 'setInterval', 'setImmediate', 'clearTimeout', 'clearInterval', 'clearImmediate'];
  return builtInFunctions.includes(functionName);
}