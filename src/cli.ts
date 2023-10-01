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

// eslint-disable-next-line @typescript-eslint/ban-types
const printInColor = (color: Function, text: string) => console.log(color(text));

const printBanner = () =>
  printInColor(chalk.green, figlet.textSync("bottleneck-js", { horizontalLayout: "full" }));

const handleExit = (exitCode: number): void => {
  exitCode && printInColor(chalk.red, `Process exited with code ${exitCode}`);
}

const printOutput = (output: Buffer | Uint8Array): void => {
  output && console.log(output.toString());
}

const measure = (filePath: string, options: { output: string }) => {
  const { output = DEFAULT_OUTPUT_PATH } = options;
  const { stdout, stderr } = Bun.spawnSync(
    ["bun", BUN_SCRIPT_PATH, filePath, output],
    { onExit: (_proc, exitCode) => handleExit(exitCode || 0) },
  );
  printOutput(stdout);
  printOutput(stderr);
};

const setupProgram = () => {
  program
    .name("bottleneck-js")
    .version("1.0.0")
    .description("Profiles all JavaScript functions of an input file and generates a report file.")
    .command("measure <filePath>")
    .description("Measures the execution time of all functions")
    .option("-o, --output <outputPath>", "Output file path", DEFAULT_OUTPUT_PATH)
    .action(measure);

  program.parse(process.argv);
};

const main = () => {
  printBanner();
  setupProgram();
};

main();
