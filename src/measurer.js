import fs from 'fs';
import { parse } from 'espree';
import estraverse from 'estraverse';
import { generate } from 'escodegen';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = process.argv[2];

const code = fs.readFileSync(path, 'utf8');
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

const writeLogFileFunction = parse('Bun.write(\'output.txt\', JSON.stringify(executions));').body[0];

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

const modifiedCode = measureTimeFunction + generate(ast);
await Bun.write("generated.js", modifiedCode)
Bun.spawnSync(["bun", "generated.js"])
const { stdout } = Bun.spawnSync(["bun", "generateReport.js"], { stdio: ['inherit'] })
console.log(stdout.toString()); // "hello\n"


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