#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const Table = require("cli-table");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
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
}

function countFetchCalls(fileContent) {
  const fetchGetRegex =
    /fetch\(\s*['"`].*?['"`]\s*,\s*({.*?method:\s*['"`]GET['"`].*?}|[^{]*?)\)/gs;

  const fetchPostRegex =
    /fetch\(\s*['"`].*?['"`]\s*,\s*{.*?(method:\s*['"`]POST['"`]|body:)/gs;
  const getMatches = fileContent.match(fetchGetRegex) || [];
  const postMatches = fileContent.match(fetchPostRegex) || [];

  return {
    total: getMatches.length + postMatches.length,
    get: getMatches.length,
    post: postMatches.length,
  };
}

function countAxiosCalls(fileContent) {
  const axiosGetRegex = /axios\s*\.\s*get\s*\(/gs;

  const axiosPostRegex = /axios\s*\.\s*post\s*\(/gs;

  const getMatches = fileContent.match(axiosGetRegex) || [];
  const postMatches = fileContent.match(axiosPostRegex) || [];

  return {
    total: getMatches.length + postMatches.length,
    get: getMatches.length,
    post: postMatches.length,
  };
}

async function searchAndCountCalls() {
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

  const currentDirectory = process.cwd();
  let totalFetchCalls = 0;
  let totalFetchGetCalls = 0;
  let totalFetchPostCalls = 0;
  let totalAxiosCalls = 0;
  let totalAxiosGetCalls = 0;
  let totalAxiosPostCalls = 0;

  walkDir(currentDirectory, (filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fetchStats = countFetchCalls(fileContent);
    const axiosStats = countAxiosCalls(fileContent);

    totalFetchCalls += fetchStats.total;
    totalFetchGetCalls += fetchStats.get;
    totalFetchPostCalls += fetchStats.post;

    totalAxiosCalls += axiosStats.total;
    totalAxiosGetCalls += axiosStats.get;
    totalAxiosPostCalls += axiosStats.post;
  });

  const table = new Table({
    head: ["API", "Total Calls", "GET Calls", "POST Calls"],
  });
  table.push(
    ["Fetch", totalFetchCalls, totalFetchGetCalls, totalFetchPostCalls],
    ["Axios", totalAxiosCalls, totalAxiosGetCalls, totalAxiosPostCalls]
  );
  console.log("\n");
  console.log(table.toString());
  console.log("\x1b[32mWe are Done!\x1b[0m");

  return table;
}

function saveTableToCSV(table) {
  const headers = ["API", "Total Calls", "GET Calls", "POST Calls"];
  const csvData =
    headers.join(",") + "\n" + table.map((row) => row.join(",")).join("\n");

  fs.writeFileSync("Api-calls.csv", csvData);
  console.log("\x1b[36mCSV file saved as Api-calls.csv\x1b[0m");
}

const args = process.argv.slice(2);

if (args[0] == "-help") {
  console.log("\x1b[36mUsage: ayu-api [options]\x1b[0m");
  console.log("\x1b[32mOptions:\x1b[0m");
  console.log(
    "  \x1b[31m-g\x1b[0m  Get the number of API calls in the project"
  );
  console.log("  \x1b[31m-d\x1b[0m  Save the result to a CSV file");

  process.exit(0);
}
if (args.length === 0) {
  console.log("\x1b[33mPlease provide options: -g or -d\x1b[0m");
} else if (args[0] !== "-g") {
  console.error("\x1b[31m-g is mandatory when using -d\x1b[0m");
  console.error("\x1b[31mPlease write: ayu-api -g or ayu-api -g -d\x1b[0m");
  process.exit(1);
}

if (args.includes("-g")) {
  const resultTable = searchAndCountCalls();
  resultTable.then((table) => {
    if (args.includes("-d")) {
      saveTableToCSV(table);
    }
  });
}
