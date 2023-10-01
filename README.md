# Bottleneck.js

Bottleneck.js is a CLI tool that profiles custom JavaScript functions of an input file and calculates their execution time. It's built with Node.js and uses the Bun runtime for fast execution.

## Features

- Measures the execution time of custom functions in a JavaScript file
- Uses the Bun runtime for fast execution
- Outputs a report file with the profiling results

## Installation

You can install dependencies with Bun.

**bun**:
``` bash
bun install 
```

## Usage

Command: **bn** is a shorthand for bottleneck-js.

To measure the execution time of all functions in a file, use the `measure` command:
```bash
bn measure <filePath>
```

You can specify the output file path with the `-o` or `--output` option:
```bash
bn measure <filePath> -o <outputPath>
```

## Contributing
Feel free to contribute with Bottleneck.js if you want.


## License
Bottleneck.js is licensed under the [MIT License](LICENSE).
