#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const Table = require("cli-table");

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
    fs.readdirSync(dir).forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const excludedDirs = ["node_modules", "dist", "build", "out", "lib"];
        if (!excludedDirs.includes(file)) {
          walkDir(filePath, callback);
        }
      } else if (stat.isFile()) {
        callback(filePath);
      }
    });
  }

  function countActiveConsoleLogs(files) {
    let totalActiveConsoleLogs = 0;
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line) => {
        if (
          line.includes("console.log") &&
          !line.includes("// console.log") &&
          !line.includes("/* console.log") &&
          !line.includes("//console.log")
        ) {
          totalActiveConsoleLogs++;
        }
      });
    });
    return totalActiveConsoleLogs;
  }

  function countCommentedConsoleLogs(files) {
    let totalCommentedConsoleLogs = 0;
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line) => {
        if (
          line.includes("// console.log") ||
          line.includes("/* console.log") ||
          line.includes("//console.log")
        ) {
          totalCommentedConsoleLogs++;
        }
      });
    });
    return totalCommentedConsoleLogs;
  }

  function countTotalConsoleLogs(files) {
    let totalConsoleLogs = 0;
    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line) => {
        if (line.includes("console.log")) {
          totalConsoleLogs++;
        }
      });
    });
    return totalConsoleLogs;
  }

  function findUncalledFunctions(files) {
    const declaredFunctions = new Set();
    const calledFunctions = new Set();

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");

      const functionDeclarations = content.match(/function\s+([^\s(]+)/g) || [];
      const arrowFunctionExpressions =
        content.match(/(?:const|let|var)\s+([^\s=]+)\s*=\s*\(/g) || [];
      const functionCalls =
        content.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]+)\s*\(/g) || [];

      functionDeclarations.forEach((declaration) => {
        const functionName = declaration.replace(/^function\s+([^\s(]+)/, "$1");
        declaredFunctions.add(functionName);
      });
      arrowFunctionExpressions.forEach((expression) => {
        const functionName = expression.replace(
          /(?:const|let|var)\s+([^\s=]+)\s*=\s*\(/,
          "$1"
        );
        declaredFunctions.add(functionName);
      });

      functionCalls.forEach((call) => {
        const functionName = call.replace(
          /^([a-zA-Z_$][a-zA-Z0-9_$]+)\s*\(/,
          "$1"
        );
        calledFunctions.add(functionName);
      });
    });

    const uncalledFunctions = [...declaredFunctions].filter(
      (func) => !calledFunctions.has(func)
    );
    return uncalledFunctions;
  }

  function countCommentedLines(files) {
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
  }

  function readPackageJson() {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(packageJsonContent);
      return packageJson.dependencies || {};
    } else {
      return {};
    }
  }

  function findUnusedPackages(files, dependencies) {
    const usedPackages = new Set();

    const importPattern =
      /import\s+[^'"]*\s*(?:\{([^}]*)\}|([^\s]+))\s*from\s*['"]([^'"]+)['"]/g;
    const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    files.forEach((file) => {
      const content = fs.readFileSync(file, "utf-8");
      let matches = content.matchAll(importPattern);
      if (matches) {
        for (const match of matches) {
          const packageName = match[3] || match[4];
          if (packageName) {
            packageName.split(",").forEach((pkg) => {
              usedPackages.add(pkg.trim());
            });
          }
        }
      }

      matches = content.matchAll(requirePattern);
      if (matches) {
        for (const match of matches) {
          const packageName = match[1];
          if (packageName) {
            usedPackages.add(packageName);
          }
        }
      }
    });

    usedPackages.delete("react-dom");

    const unusedPackages = Object.keys(dependencies).filter(
      (packageName) =>
        packageName !== "react-dom" && !usedPackages.has(packageName)
    );
    return unusedPackages;
  }

  const files = [];

  const currentDirectory = process.cwd();

  walkDir(currentDirectory, (filePath) => {
    files.push(filePath);
  });

  const activeConsoleLogsCount = countActiveConsoleLogs(files);
  const commentedConsoleLogsCount = countCommentedConsoleLogs(files);
  const totalConsoleLogsCount = countTotalConsoleLogs(files);
  const uncalledFunctions = findUncalledFunctions(files);
  const totalCommentedLinesCount = countCommentedLines(files);

  console.log(
    "\n\x1b[32mTotal Active console.log Statements:\x1b[0m",
    activeConsoleLogsCount
  );
  console.log(
    "\x1b[32mTotal Commented console.log Statements:\x1b[0m",
    commentedConsoleLogsCount
  );
  console.log(
    "\x1b[32mTotal Console.log Statements:\x1b[0m",
    totalConsoleLogsCount
  );
  console.log(
    "\x1b[32mTotal Uncalled Functions:\x1b[0m",
    uncalledFunctions.length
  );
  console.log(
    "\x1b[32mTotal Commented Lines:\x1b[0m",
    totalCommentedLinesCount
  );

  const dependencies = readPackageJson();

  const unusedPackages = findUnusedPackages(files, dependencies);
  const table = new Table({
    head: ["Package", "Version"],
    colWidths: [30, 20],
  });

  unusedPackages.forEach((packageName) => {
    const version = dependencies[packageName];
    table.push([packageName, version]);
  });

  console.log("\x1b[32mTotal Unused Packages:\x1b[0m", unusedPackages.length);
  console.log("\x1b[32mTotal Unused Packages List:\x1b[0m" + "\n");

  console.log(table.toString());

  process.stdout.write("\r\x1b[31mDone\x1b[0m  \n");

  const data = {
    activeConsoleLogsCount,
    commentedConsoleLogsCount,
    totalConsoleLogsCount,
    uncalledFunctionsCount: uncalledFunctions.length,
    totalCommentedLinesCount,
    unusedPackages,
    unusedPackagesCount: unusedPackages.length,
  };

  return data;
};

const saveTableToCSV = (data) => {
  const unusedPackagesFormatted = data.unusedPackages.join("\n");

  const csvContent =
    `Total Active console.log,${data.activeConsoleLogsCount}\n` +
    `Total commented console.log,${data.commentedConsoleLogsCount}\n` +
    `Total console.log,${data.totalConsoleLogsCount}\n` +
    `Total Uncalled Functions,${data.uncalledFunctionsCount}\n` +
    `Total Commented Lines,${data.totalCommentedLinesCount}\n` +
    `Total Unused Packages List:,\n${unusedPackagesFormatted}\n` +
    `Total Unused Packages,${data.unusedPackagesCount}\n`;

  fs.writeFileSync("Unused.csv", csvContent);
  return 1;
};

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Please provide options: -g or -d");
} else if (args[0] != "-g") {
  console.error("-g is mandatory when using -d");
  console.error("Please write: ayu-free -g or ayu-free -g -d");
  process.exit(1);
}

if (args.includes("-g")) {
  const resultTable = main().catch((error) => {
    console.error("An error occurred:", error);
  });
  resultTable.then((table) => {
    if (args.includes("-d")) {
      let flag = saveTableToCSV(table);
      if (flag === 1) {
        console.log("\x1b[36mData saved in Unused.csv\x1b[0m");
      }
    }
  });
}
