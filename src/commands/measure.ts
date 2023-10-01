import { parse } from "espree"
import estraverse from "estraverse"
import { generate } from "escodegen"
import { unlinkSync } from "node:fs"
import chalk from "chalk"
import { markdownTable } from "markdown-table"
import fs from "fs"

// TODO: Add types, move AST methods to astUtils. Shrink size of files, add unit tests.

const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600000)
  const minutes = Math.floor((duration % 3600000) / 60000)
  const seconds = Math.floor((duration % 60000) / 1000)
  const milliseconds = duration % 1000
  let formattedDuration = ""
  if (hours > 0) formattedDuration += `${hours}h `
  if (minutes > 0) formattedDuration += `${minutes}m `
  if (seconds > 0) formattedDuration += `${seconds}s `
  if (milliseconds > 0) formattedDuration += `${milliseconds}ms`
  return formattedDuration.trim()
}

const createReport = (executions: any[]) => {
  return executions.map(({ name, duration }) => {
    const formattedDuration = formatDuration(duration)
    return [chalk.cyan(name), chalk.yellow(formattedDuration)]
  })
}

const printReport = (output: string) => {
  const data = fs.readFileSync(output, "utf8")
  const executions = JSON.parse(data)
  const sortedExecutions = executions.sort((a, b) => b.duration - a.duration)
  const report = createReport(sortedExecutions)
  const table = markdownTable([["function", "duration"], ...report])
  console.log(table)
}


function getFunctionName(node) {
  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  return null;
}

function isBuiltInFunction(functionName) {
  const builtInFunctions = [
    "setTimeout",
    "setInterval",
    "setImmediate",
    "clearTimeout",
    "clearInterval",
    "clearImmediate",
  ];
  return builtInFunctions.includes(functionName);
}

function handleNode(node, parent) {
  if (
    node.type === "CallExpression" &&
    node.callee.type !== "MemberExpression"
  ) {
    const functionName = getFunctionName(node);
    if (
      functionName &&
      !isBuiltInFunction(functionName) &&
      functionName !== "measureTime"
    ) {
      const isAlreadyAwaited = parent.type === "AwaitExpression";
      const callExpression = {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "measureTime",
        },
        arguments: [
          {
            type: "Identifier",
            name: functionName,
          },
          {
            type: "Literal",
            value: functionName,
          },
          ...node.arguments,
        ],
      };
      return isAlreadyAwaited
        ? callExpression
        : { type: "AwaitExpression", argument: callExpression };
    }
  } else if (
    node.type === "ArrowFunctionExpression" &&
    parent.type === "CallExpression" &&
    parent.callee.property &&
    parent.callee.property.name === "get"
  ) {
    // This is an Express.js middleware function
    const middlewareFunctionName = parent.arguments[0].value; // The route path
    const callExpression = {
      type: "CallExpression",
      callee: {
        type: "Identifier",
        name: "measureTime",
      },
      arguments: [
        node,
        {
          type: "Literal",
          value: middlewareFunctionName,
        },
      ],
    };
    return { type: "AwaitExpression", argument: callExpression };
  }
}
function getParseOptions() {
  return {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  };
}

export const measure = async (filePath: string, { output }: { output: string }) => {
  const inputFile = Bun.file(filePath)
  const code = await inputFile.text()
  let ast = parse(code, getParseOptions())

  ast = estraverse.replace(ast, {
    enter: handleNode,
  })

  const measureTimeFunction = `
  let executions = []
  async function measureTime(fn, fnName = 'anonFunction', ...args) {
    const start = performance.now()
    const result = await fn(...args)
    const end = performance.now()
    const duration = end - start
    executions.push({ name: fnName, duration })
    return result
  }
`

  const writeLogFileFunction = parse(
    `Bun.write(\'${output}\', JSON.stringify(executions));`,
  ).body[0]

  let iifeFound = false

  estraverse.traverse(ast, {
    enter(node) {
      if (
        node.type === "CallExpression" &&
        node.callee.type === "ArrowFunctionExpression"
      ) {
        node.callee.body.body.push(writeLogFileFunction)
        iifeFound = true
      }
    },
  })

  if (!iifeFound) {
    ast.body.push(writeLogFileFunction)
  }

  const modifiedCode = measureTimeFunction + generate(ast)
  await Bun.write("generated.js", modifiedCode)
  Bun.spawnSync(["bun", "generated.js"])
  printReport(output)
  unlinkSync("generated.js")
}