#!/usr/bin/env bun
import chalk from "chalk"
import { program } from "commander";
import { measure } from "./commands/measure";
import figlet from "figlet";

const setupProgram = () => {
  program
    .name("bottleneck-js")
    .version("1.0.0")
    .description("Profiles all JavaScript functions of an input file and generates a report file.")
    .command("measure <filePath>")
    .description("Measures the execution time of all functions")
    .option("-o, --output <outputPath>", "Output file path", "output.txt")
    .action(measure);

  program.parse(process.argv);
};

// eslint-disable-next-line @typescript-eslint/ban-types
const printInColor = (color: Function, text: string) => console.log(color(text));

const printBanner = () =>
  printInColor(chalk.green, figlet.textSync("bottleneck-js", { horizontalLayout: "full" }));

const main = () => {
  if(process.argv.length === 2)
    printBanner();
  setupProgram();
};

main();
