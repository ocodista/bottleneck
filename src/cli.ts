#!/usr/bin/env bun

import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUN_SCRIPT_PATH = join(__dirname, "bun-measurer.ts");

const DEFAULT_OUTPUT_PATH = "output.txt";
function printBanner() {
  console.log(
    chalk.green(
      figlet.textSync("bottleneck-js", {
        horizontalLayout: "full",
      }),
    ),
  );
}

function handleExit(exitCode: number) {
  if (!exitCode) return;
  console.log(chalk.red(`Process exited with code ${exitCode}`));
}

function measure(filePath: string, options: { output: string }) {
  const { output = DEFAULT_OUTPUT_PATH } = options;
  const scriptPath = BUN_SCRIPT_PATH;
  const { stdout, stderr } = Bun.spawnSync(
    ["bun", scriptPath, filePath, output],
    {
      onExit: (_proc, exitCode) => handleExit(exitCode || 0),
    },
  );
  stdout && console.log(stdout.toString());
  stderr && console.log(stderr.toString());
}

function setupProgram() {
  program
    .name("bottleneck-js")
    .description("use bn to execute")
    .version("1.0.0")
    .description(
      "Profiles all JavaScript functions of an input file and generates a report file.",
    );

  program
    .command("measure <filePath>")
    .description("Measures the execution time of all functions")
    .option(
      "-o, --output <outputPath>",
      "Output file path",
      DEFAULT_OUTPUT_PATH,
    )
    .action(measure);

  program.parse(process.argv);
}

function main() {
  printBanner();
  setupProgram();
}

main();
