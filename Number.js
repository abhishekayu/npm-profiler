#!/usr/bin/env node --max-old-space-size=8192

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const Table = require("cli-table");
const babelParser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

async function main() {
  let loadingInterval;
  try {
    const loadingChars = [
      "\x1b[33m|\x1b[0m",
      "\x1b[32m/\x1b[0m",
      "\x1b[36m -\x1b[0m",
      "\x1b[35m\\\x1b[0m",
    ];

    let i = 0;
    const spinner = [
      "\x1b[33mA\x1b[0m",
      "\x1b[32mY\x1b[0m",
      "\x1b[35mU\x1b[0m",
      "\x1b[36mA\x1b[0m",
      "\x1b[31mY\x1b[0m",
      "\x1b[34mU\x1b[0m",
      "\x1b[33mA\x1b[0m",
      "\x1b[32mY\x1b[0m",
      "\x1b[35mU\x1b[0m",
      "\x1b[36mA\x1b[0m",
      "\x1b[31mY\x1b[0m",
      "\x1b[34mU\x1b[0m",
    ];
    let currentSpinnerIndex = 0;

    loadingInterval = setInterval(() => {
      process.stdout.write(
        "\r\x1b[31mProcessing \x1b[ " +
          " " +
          spinner[currentSpinnerIndex] +
          loadingChars[currentSpinnerIndex] +
          " "
      );
      currentSpinnerIndex =
        ((currentSpinnerIndex + 1) % spinner.length) % loadingChars.length;
    }, 100);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(
      "\n\x1b[36mPlease wait, we are surrounding your universe...\x1b[0m\n"
    );
    await mainExecutions();
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    clearInterval(loadingInterval);
    process.stdout.write("\r\x1b[31mDone\x1b[0m  \n");
  }
}

async function mainExecutions() {
  const args = process.argv.slice(2);
  let options = {
    global: false,
    skipNodeModules: true,
    whitespace: false,
    downloadCSV: false,
  };

  if (args.length === 0) {
    console.error("Please provide options: -g, -n, -w or -d");
    process.exit(1);
  }

  args.forEach((arg, index) => {
    switch (arg) {
      case "-g":
      case "--global":
        options.global = true;
        break;
      case "-n":
        options.skipNodeModules = false;
        break;
      case "-w":
        options.whitespace = true;
        break;
      case "-d":
        options.downloadCSV = true;
        break;
      case "-c":
        options.countComments = true;
        break;

      case "-help":
        console.log(
          "Usage: ayu-count [options]\n",
          "Options:\n",
          "-g, --global: Mandatory option to run the command\n",
          "-n: Include node_modules\n",
          "-w: Include whitespace\n",
          "-d: Download CSV file\n",
          "-c: Count commented lines"
        );
        break;

      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  });

  if (!options.global) {
    console.error("-g is mandatory when using -n, -w, -c, or -d");
    console.error(
      "Please write: ayu-count -g or ayu-count -g -n or ayu-count -g -w or ayu-count -g -d or ayu-count -g -n -w -d or ayu-count -g -c"
    );
    process.exit(1);
  }

  const countCommentedLines = (files) => {
    let totalCommentedLines = 0;
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line) => {
        if (line.trim().startsWith("//")) {
          totalCommentedLines++;
        }
      });
    });
    return totalCommentedLines;
  };

  let totalFiles = 0;
  let totalLines = 0;
  let totalReactComponents = 0;
  let totalReactRouters = 0;
  let commentedLinesCount = 0;

  const getAllFiles = (dir, exts, skipNodeModules) => {
    let files = [];
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (
          skipNodeModules &&
          ["node_modules", "dist", "build", "out", "lib"].includes(file)
        ) {
          return;
        }
        files = files.concat(getAllFiles(filePath, exts, skipNodeModules));
      } else {
        if (exts.includes(path.extname(filePath))) {
          files.push(filePath);
        }
      }
    });
    return files;
  };

  const countLines = (files, includeWhitespace) => {
    let totalLines = 0;
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      if (includeWhitespace) {
        totalLines += content.split("\n").length;
      } else {
        const lines = content
          .split("\n")
          .filter((line) => line.trim() !== "").length;
        totalLines += lines;
      }
    });
    return totalLines;
  };

  const countReactComponents = (files) => {
    let totalComponents = 0;
    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const ast = babelParser.parse(content, {
          sourceType: "module",
          plugins: ["jsx"],
        });
        let componentsInFile = 0;
        traverse(ast, {
          JSXElement() {
            componentsInFile++;
          },
        });
        totalComponents += componentsInFile;
      } catch (error) {}
    });
    return totalComponents;
  };

  const countReactRouters = (files) => {
    let totalReactRouters = 0;
    files.forEach((file) => {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const ast = babelParser.parse(content, {
          sourceType: "module",
          plugins: ["jsx"],
        });

        traverse(ast, {
          JSXElement(path) {
            const openingElement = path.node.openingElement;
            if (
              openingElement.name.name === "BrowserRouter" ||
              openingElement.name.name === "Router"
            ) {
              totalReactRouters++;
            } else if (openingElement.name.name === "Route") {
              const parentElement = path.findParent((p) => p.isJSXElement());
              if (
                parentElement &&
                parentElement.node.openingElement.name.name === "Routes"
              ) {
                totalReactRouters++;
              }
            }
          },
        });
      } catch (error) {}
    });
    return totalReactRouters;
  };

  const extensions = [
    ".js",
    ".jsx",
    ".css",
    ".html",
    ".json",
    ".md",
    ".ts",
    ".tsx",
    ".scss",
    ".less",
    ".sass",
    ".graphql",
    ".yml",
    ".yaml",
    ".xml",
    ".php",
    ".py",
    ".rb",
    ".java",
    ".go",
    ".htm",
    ".xhtml",
    ".asp",
    ".aspx",
    ".php",
    ".jsp",
    ".cfm",
    ".rss",
    ".svg",
    ".txt",
    ".log",
    ".csv",
    ".tsv",
    ".ini",
    ".env",
    ".sh",
    ".bat",
    ".cmd",
    ".ps1",
    ".psm1",
    ".config",
    ".conf",
    ".properties",
    ".gitignore",
    ".npmignore",
    ".yarnignore",
    ".dockerignore",
    ".editorconfig",
    ".babelrc",
    ".eslintrc",
    ".prettierrc",
    ".stylelintrc",
    ".huskyrc",
    ".lintstagedrc",
    ".xliff",
    ".xlsx",
    ".docx",
    ".pptx",
    ".exe",
    ".dll",
    ".lib",
    ".obj",
    ".bin",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".mp4",
  ];

  const countConfigFiles = (files) => {
    const configFiles = files.filter((file) => {
      const fileName = path.basename(file).toLowerCase();
      return fileName.includes(".config") || fileName.includes("config");
    });
    return configFiles.length;
  };

  const basePath = process.cwd();
  const files = getAllFiles(basePath, extensions, options.skipNodeModules);
  totalFiles = files.length;
  totalLines = countLines(files, options.whitespace);
  totalReactComponents = countReactComponents(files);
  totalReactRouters = countReactRouters(files);
  if (options.countComments) {
    commentedLinesCount = countCommentedLines(files);
  }
  const totalConfigFiles = countConfigFiles(files);

  if (totalFiles > 0 || totalLines > 0) {
    const table = new Table({
      head: ["Extension", "TotalFiles", "TotalLines"],
    });

    extensions.forEach((extension) => {
      const filteredFiles = files.filter(
        (file) => path.extname(file) === extension
      );
      if (filteredFiles.length > 0) {
        table.push([
          extension,
          filteredFiles.length,
          countLines(filteredFiles, options.whitespace),
        ]);
      }
    });

    console.log("\n" + table.toString());

    if (totalFiles > 0) {
      console.log("\x1b[32mTotal Files:\x1b[0m", totalFiles);
    }
    if (totalLines > 0) {
      console.log("\x1b[32mTotal Lines of Code:\x1b[0m", totalLines);
    }
    console.log("\x1b[32mTotal React Components:\x1b[0m", totalReactComponents);
    console.log("\x1b[32mTotal React Routers:\x1b[0m", totalReactRouters);
    console.log("\x1b[32mTotal Configuration Files:\x1b[0m", totalConfigFiles);
    if (options.countComments) {
      console.log("\x1b[32mTotal Commented Lines:\x1b[0m", commentedLinesCount);
    }
    if (options.downloadCSV) {
      function saveTableToCSV(table) {
        const csvData = table.map((row) => row.join(",")).join("\n");
        fs.writeFileSync("Project-count.csv", csvData);
        console.log("\x1b[36mCSV file saved as Project-count.csv\x1b[0m");
      }

      const secondTable = [
        ["Total Files", totalFiles],
        ["Total Lines of Code", totalLines],
        ["Total React Components", totalReactComponents],
        ["Total React Routers", totalReactRouters],
        ["Total Configuration Files", totalConfigFiles],
      ];

      saveTableToCSV([...table, ...secondTable]);
    }
  }
}

main().catch(console.error);
