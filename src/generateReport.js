import fs from "fs";
import chalk from "chalk";
import { markdownTable } from "markdown-table";

const output = process.argv[2] || "output.txt";

function formatDuration(duration) {
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  const milliseconds = duration % 1000;
  let formattedDuration = "";
  if (hours > 0) formattedDuration += `${hours}h `;
  if (minutes > 0) formattedDuration += `${minutes}m `;
  if (seconds > 0) formattedDuration += `${seconds}s `;
  if (milliseconds > 0) formattedDuration += `${milliseconds}ms`;
  return formattedDuration.trim();
}

function createReport(executions) {
  return executions.map(({ name, duration }) => {
    const formattedDuration = formatDuration(duration);
    return [chalk.cyan(name), chalk.yellow(formattedDuration)];
  });
}

function printReport() {
  const data = fs.readFileSync(output, "utf8");
  const executions = JSON.parse(data);
  const sortedExecutions = executions.sort((a, b) => b.duration - a.duration);
  const report = createReport(sortedExecutions);
  const table = markdownTable([["function", "duration"], ...report]);
  console.log(table);
}

printReport();
