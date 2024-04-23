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
          /(?<!\/\*\s*|\/\/\s*)\bconsole\.log\(([^)]+)\);?(?!\s*\*\/)/g,
          (match, group1) => {
            if (!match.startsWith("//") && !match.startsWith("/*")) {
              const lines = match.split("\n");
              const commentedLines = lines.map((line) => `// ${line}`);
              return commentedLines.join("\n");
            }
            return match;
          }
        );

        fs.writeFile(filePath, commentedData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            // console.log("Commented out console.log statements in:", filePath);
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
        // Updated regular expression to remove all occurrences of console.log
        let newData = data.replace(
          /(?:(?<!\/\*)|\/\/)\s*console\.log\([^;]+\);?/g,
          ""
        );

        // Remove empty comments like "// this" and "/*   */"
        newData = newData.replace(/(\/\/\s*$)|(\/\*\s*\*\/)/gm, "");
        newData = newData.replace(/\n{3,}/g, "\n\n");

        newData = newData.replace(/^\s*[\r\n]/gm, "");

        fs.writeFile(filePath, newData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            // console.log(
            //   "Removed all console.log statements and empty comments in:",
            //   filePath
            // );
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
        // Updated regular expression to remove all active occurrences of console.log
        let newData = data.replace(
          /(?<!\/\*\s*|\/\/\s*)console\.log\([^;]+?\);?/g,
          ""
        );

        // Remove empty comments like "// this" and "/*   */"
        newData = newData.replace(/(\/\/\s*$)|(\/\*\s*\*\/)/gm, "");
        newData = newData.replace(/\n{3,}/g, "\n\n");

        fs.writeFile(filePath, newData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            // console.log(
            //   "Removed all active console.log statements and empty comments in:",
            //   filePath
            // );
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
        // Updated regular expression to remove only commented occurrences of console.log
        let newData = data.replace(
          /\/\/[^\n]*console\.log\([^;]+\);?|\/\*[\s\S]*?\*\/\s*/g,
          ""
        );

        // Remove empty lines
        newData = newData.replace(/^\s*[\r\n]/gm, "");

        fs.writeFile(filePath, newData, "utf8", (err) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            // console.log(
            //   "Removed all commented console.log statements and empty block comments in:",
            //   filePath
            // );
          }
        });
      });
    }
  }

  const projectDirectory = process.cwd();
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.error("Please pass only one argument at a time.");
    process.exit(1);
  }

  const action = args[0];

  switch (action) {
    case "-gc":
      walkDir(projectDirectory, commentOutConsoleLogs);
      break;
    case "-gr":
      walkDir(projectDirectory, removeAllConsoleLogs);
      break;
    case "-gar":
      walkDir(projectDirectory, removeAllActiveConsoleLogs);
      break;
    case "-gcr":
      walkDir(projectDirectory, removeCommentedConsoleLogs);
      break;

    case "-help":
      console.log(
        "Usage: ayu-console [option]\n\nOptions:\n  -gc\tComment out all console.log statements\n  -gr\tRemove all console.log statements\n  -gar\tRemove all active console.log statements\n  -gcr\tRemove all inactive/commented console.log statements"
      );
      break;
    default:
      console.error(
        "Invalid argument. Please use one of: -gc, -gr, -gar, -gcr"
      );
      process.exit(1);
  }
};

main();
