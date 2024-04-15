#!/usr/bin/env node
const fs = require("fs").promises;
const path = require("path");
const Table = require("cli-table");
const rootDirectory = "./";
async function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      if (path.basename(filePath) !== "node_modules") {
        totalSize += await getDirectorySize(filePath);
      }
    } else {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

async function getFolderSizes(rootDir) {
  const folderSizes = {};

  async function calculateFolderSize(dirPath) {
    let totalSize = 0;

    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.lstat(filePath);

      if (stats.isDirectory()) {
        if (stats.isSymbolicLink()) {
          continue;
        }
        totalSize += await calculateFolderSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }
  const folders = await fs.readdir(rootDir);

  for (const folder of folders) {
    const folderPath = path.join(rootDir, folder);
    const stats = await fs.lstat(folderPath);

    if (stats.isDirectory() && !stats.isSymbolicLink()) {
      const size = await calculateFolderSize(folderPath);
      folderSizes[folder] = size;
    }
  }

  return folderSizes;
}
async function printFolderSizes(
  folderSizes,
  prefix = "",
  table = new Table({
    head: ["Folder", "Size"],
  })
) {
  const filteredFolders = Object.entries(folderSizes).filter(
    ([folder]) =>
      ![
        "node_modules",
        "dist",
        "build",
        "out",
        "lib",
        "target",
        "bin",
        "obj",
        "tmp",
        "temp",
      ].includes(folder)
  );

  for (const [folder, size] of filteredFolders) {
    const folderPath = path.join(prefix, folder);
    table.push([folderPath, formatFileSize(size)]);
    const subFolderSizes = await getFolderSizes(folderPath);
    await printFolderSizes(subFolderSizes, folderPath + "/", table);
  }
  return table;
}

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
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    clearInterval(loadingInterval);
  }
  let arr = [];
  try {
    const rootDirectory = "./";
    const totalSize = await getDirectorySize(rootDirectory);
    arr.push([
      "Total size of the (/) without folders",
      formatFileSize(totalSize),
    ]);
    console.log(
      `\x1b[32mTotal size of the (/) without folders:\x1b[0m \x1b[36m${formatFileSize(
        totalSize
      )}\x1b[0m`
    );
    const excludedFolders = [
      "node_modules",
      "dist",
      "build",
      "out",
      "lib",
      "target",
      "bin",
      "obj",
      "tmp",
      "temp",
    ];
    excludedFolders.forEach(async (folder) => {
      try {
        const folderPath = path.join(rootDirectory, folder);
        const folderSize = await getDirectorySize(folderPath);
        arr.push([folder, formatFileSize(folderSize)]);
        console.log(
          `\x1b[32mSize of '${folder}':\x1b[0m \x1b[36m${formatFileSize(
            folderSize
          )}\x1b[0m`
        );
      } catch (error) {
        if (error.code === "ENOENT") {
        } else {
          console.error(`Error while processing '${folder}':`, error);
        }
      }
    });

    const folderSizes = await getFolderSizes(rootDirectory);
    console.log(`\x1b[33mSizes of all folders:\x1b[0m`);
    let tabe = await printFolderSizes(folderSizes);
    console.log(tabe.toString());
    return arr;
  } catch (error) {
    console.error("Error:", error);
  }
}

function formatFileSize(sizeInBytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (sizeInBytes >= 1024 && index < units.length - 1) {
    sizeInBytes /= 1024;
    index++;
  }
  return `${sizeInBytes.toFixed(2)} ${units[index]}`;
}

async function saveToCsv(tableData, filePath) {
  try {
    const csvData =
      "Folder,Size\n" + tableData.map((row) => row.join(",")).join("\n");
    await fs.writeFile(filePath, csvData);
    console.log(`\x1b[33mCSV data saved to ${filePath}\x1b[0m`);
  } catch (error) {
    console.error("Error while saving CSV:", error);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Please provide options: -g or -d");
} else if (args[0] != "-g") {
  console.error("-g is mandatory when using -d");
  console.error("Please write: ayu-size -g or ayu-size -g -d");
  process.exit(1);
}

if (args.includes("-g")) {
  main()
    .then(async (res) => {
      const folderSizes = await getFolderSizes(rootDirectory);
      const table = await printFolderSizes(folderSizes);
      if (args.includes("-d")) {
        await saveToCsv([...table, ...res], "Folder-sizes.csv");
      }
      process.stdout.write("\r\x1b[31mDone\x1b[0m  \n");
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}
