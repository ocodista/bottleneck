# Measurer.js

Measurer.js is a CLI tool that profiles all JavaScript functions of an input file and generates a report file. It's built with Node.js and uses the Bun runtime for fast execution.


## Features

- Measures the execution time of all functions in a JavaScript file
- Supports both Node.js and Bun runtimes
- Outputs a report file with the profiling results

## Installation

You can install Measurer.js globally with npm:
```bash
npm install -g measurer.js
```

## Usage

To measure the execution time of all functions in a file, use the `measure` command:
```bash
measurer.js measure <filePath>
```

You can specify the output file path with the `-o` or `--output` option:
```bash
measurer.js measure <filePath> -o <outputPath>
```

You can specify the runtime to use with the `-r` or `--runtime` option. The default is `node`, but you can also use `bun`:
```
measurer.js measure <filePath> -r bun
```

## Contributing
Feel free to contribute with Measurer.js if you want.


## License
Measurer.js is licensed under the [MIT License](LICENSE).
