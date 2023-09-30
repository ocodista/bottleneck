import { program } from 'commander';
import chalk from 'chalk';
import { spawn } from 'bun';

program
  .name('measurer.js')
  .version('1.0.0')
  .description(chalk.green('measurer.js profiles all JavaScript functions of an input file and generates a report file.'));

program
  .command('measure <filePath>')
  .description('Measures the execution time of all functions')
  .option('-o, --output <outputPath>', 'Output file path', 'output.txt')
  .option('-r, --runtime <runtime>', 'Runtime to use', 'bun')
  .action(async (filePath, options) => {
    const { output, runtime } = options;
    const scriptPath = runtime === 'node' ? './src/node-esm-measurer.js' : './src/bun-measurer.js';
    const proc = spawn([runtime, scriptPath, filePath, output], {
      onExit: (_proc, exitCode) => {
        exitCode && console.log(chalk.red(`Process exited with code ${exitCode}`));
      }
    });
    const outputText = await new Response(proc.stdout).text()
    console.log(outputText);
  });

program.parse(process.argv);