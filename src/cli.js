import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { spawn } from 'child_process';

const DEFAULT_OUTPUT_PATH = 'output.txt';
const DEFAULT_RUNTIME = 'node';
const NODE_RUNTIME = 'node';
const NODE_SCRIPT_PATH = './src/node-esm-measurer.js';
const BUN_SCRIPT_PATH = './src/bun-measurer.js';

function printBanner() {
  console.log(
    chalk.green(
      figlet.textSync('measurer.js', {
        horizontalLayout: 'full',
      })
    )
  );
}

function handleExit(exitCode) {
  if (exitCode) {
    console.log(chalk.red(`Process exited with code ${exitCode}`));
  }
}

function measure(filePath, options) {
  const { output = DEFAULT_OUTPUT_PATH, runtime = DEFAULT_RUNTIME } = options;
  const scriptPath = runtime === NODE_RUNTIME ? NODE_SCRIPT_PATH : BUN_SCRIPT_PATH;
  const proc = spawn(runtime, [scriptPath, filePath, output]);

  proc.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  proc.on('exit', handleExit);
}

function setupProgram() {
  program
    .name('measurer.js')
    .version('1.0.0')
    .description('Profiles all JavaScript functions of an input file and generates a report file.');

  program
    .command('measure <filePath>')
    .description('Measures the execution time of all functions')
    .option('-o, --output <outputPath>', 'Output file path', DEFAULT_OUTPUT_PATH)
    .option('-r, --runtime <runtime>', 'Runtime to use', DEFAULT_RUNTIME)
    .action(measure);

  program.parse(process.argv);
}

function main() {
  printBanner();
  setupProgram();
}

main();