#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const main = async () => {
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
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    clearInterval(loadingInterval);
  }

  function walkDir(dir, callback) {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        fs.stat(filePath, (err, stat) => {
          if (err) {
            console.error("Error getting file stat:", err);
            return;
          }

          if (stat.isDirectory()) {
            if (
              file !== "node_modules" &&
              file !== "dist" &&
              file !== "build" &&
              file !== "out" &&
              file !== "lib"
            ) {
              walkDir(filePath, callback);
            }
          } else if (stat.isFile()) {
            callback(filePath);
          }
        });
      });
    });
  }

  function commentOutConsoleLogs(filePath) {
    if (
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx")
    ) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        const commentedData = data.replace(
          /(?<!\/\/\s*AYU\s*-\s*)\bconsole\.log\(([^)]+)\);?(?!\s*\*\/)/g,
          (match, group1) => {
            const lines = match.split("\n");
            const commentedLines = lines.map((line) => {
              if (!line.trim().startsWith("// AYU -")) {
                return `// AYU - ${line}`;
              }
              return line;
            });
            return commentedLines.join("\n");
          }
        );

        fs.writeFile(filePath, commentedData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
          }
        });
      });
    }
  }

  function removeAllConsoleLogs(filePath) {
    if (
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx")
    ) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        let newData = data.replace(
          /\/\*\s*[\s\S]*?console\.log\([^;]+\);?[\s\S]*?\*\/|\/\/\s*console\.log\([^;]*\);?(?![^\/]*\*\/)|\/\/\s*AYU-\s*console\.log\([^;]*\);?|AYU-\s*console\.log\([^;]*\);?|\/\/[^\n]*console\.log\([^;]*\);?(?![^\/]*\*\/)|^\s*\/\/\s*data\s+is\s+store\s+in\s+mu\s+jkdjo\s+console\.log\([^;]+\);?|console\.log\([^;]+?\);?/gm,
          ""
        );

        newData = newData.replace(/^\s*[\r\n]/gm, "");

        fs.writeFile(filePath, newData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
          }
        });
      });
    }
  }

  function removeAllActiveConsoleLogs(filePath) {
    if (
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx")
    ) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
        let newData = data.replace(
          /(?<!\/\/\s*AYU-\s*)console\.log\([^;]+?\);?(?![^\/]*\*\/)|\/\/\s*console\.log\([^;]+?\);?/g,
          (match, p1) => {
            if (match.startsWith("//")) {
              return match;
            } else {
              return "";
            }
          }
        );

        newData = newData.replace(/(\/\/\s*$)|(\/\*\s*\*\/)/gm, "");
        newData = newData.replace(/\n{3,}/g, "\n\n");

        fs.writeFile(filePath, newData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
          }
        });
      });
    }
  }

  function removeCommentedConsoleLogs(filePath) {
    if (
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx")
    ) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
        let newData = data.replace(
          /\/\/[^\n]*console\.log\([^;]+\);?.*(?:\r?\n|$)|\/\*[\s\S]*?\*\/\s*/g,
          ""
        );

        newData = newData.replace(/^\s*[\r\n]/gm, "");

        fs.writeFile(filePath, newData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
          }
        });
      });
    }
  }

  function uncommentConsoleLogs(filePath) {
    if (
      filePath.endsWith(".js") ||
      filePath.endsWith(".jsx") ||
      filePath.endsWith(".ts") ||
      filePath.endsWith(".tsx")
    ) {
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }

        const uncommentedData = data.replace(
          /\/\/\s*AYU\s*-\s*(.*)$/gm,
          (match, group1) => {
            const indentation = group1.match(/^\s*/)[0];
            const uncommentedLine = group1
              .replace(/\/\/\s*AYU\s*-\s*/, "")
              .trim()
              .split("\n")
              .map((line, index) =>
                index === 0 ? line.trim() : `${indentation}${line.trim()}`
              )
              .join("\n");
            return uncommentedLine;
          }
        );
        fs.writeFile(filePath, uncommentedData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
          }
        });
      });
    }
  }

  const projectDirectory = process.cwd();
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("\x1b[31mPlease pass only one argument at a time\x1b[0m");
    process.exit(1);
  }

  const action = args[0];

  switch (action) {
    case "-gc":
      console.log(
        "Commenting out all console.log statements are in progress..."
      );
      walkDir(projectDirectory, commentOutConsoleLogs);
      console.log("\x1b[32mWe are Done!\x1b[0m");
      break;
    case "-gr":
      console.log("Removing all console.log statements are in progress...");
      walkDir(projectDirectory, removeAllConsoleLogs);
      console.log("\x1b[32mWe are Done!\x1b[0m");
      break;
    case "-gar":
      console.log(
        "Removing all active console.log statements are in progress..."
      );
      walkDir(projectDirectory, removeAllActiveConsoleLogs);
      console.log("\x1b[32mWe are Done!\x1b[0m");
      break;
    case "-gcr":
      console.log(
        "Removing all inactive/commented console.log statements are in progress..."
      );
      walkDir(projectDirectory, removeCommentedConsoleLogs);
      console.log("\x1b[32mWe are Done!\x1b[0m");
      break;

    case "-guc":
      console.log("Uncommenting all console.log statements are in progress...");
      walkDir(projectDirectory, uncommentConsoleLogs);
      console.log("\x1b[32mWe are Done!\x1b[0m");
      break;

    case "-help":
      console.log(
        "Usage: \x1b[33mayu-console [option]\x1b[0m\n\nOptions:\n  \r\x1b[31m-gc\x1b[0m\tComment out all console.log statements\n  \r\x1b[31m-gr\x1b[0m\tRemove all console.log statements\n  \r\x1b[31m-gar\x1b[0m\tRemove all active console.log statements\n  \r\x1b[31m-gcr\x1b[0m\tRemove all inactive/commented console.log statements \n  \r\x1b[31m-guc\x1b[0m\tUncomment all console.log statements\n \r\x1b[31m-help\x1b[0m\tDisplay this help message \n \n \r\x1b[31mNote : Uncommented console.log statements will only work if they were commented out by this tool.\r\x1b[31ms"
      );
      break;
    default:
      console.error(
        "\x1b[31mInvalid argument. Please use one of: -gc, -gr, -gar, -gcr, -guc, -help\x1b[0m"
      );

      process.exit(1);
  }
};

main();
