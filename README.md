# Measurer.js

Measurer.js is a CLI tool that profiles all JavaScript functions of an input file and generates a report file. It's built with Node.js and uses the Bun runtime for fast execution.

![Banner](banner.png)

## Features

- Measures the execution time of all functions in a JavaScript file
- Supports both Node.js and Bun runtimes
- Outputs a report file with the profiling results

## Installation

You can install Measurer.js globally with npm:
```
bash
npm install -g measurer.js
```

## Usage

To measure the execution time of all functions in a file, use the `measure` command:
```
measurer.js measure <filePath>
```

You can specify the output file path with the `-o` or `--output` option:
```
measurer.js measure <filePath> -o <outputPath>
```

You can specify the runtime to use with the `-r` or `--runtime` option. The default is `bun`, but you can also use `node`:
```
measurer.js measure <filePath> -r node
```

## Contributing

We welcome contributions to Measurer.js! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## License

Measurer.js is licensed under the [MIT License](LICENSE).