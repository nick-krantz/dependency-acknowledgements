const fs = require('fs');
const readline = require('readline');

/**
 * Read file from input `filePath` and invoke `lineCallback` for every line.
 *
 * @param {string} filePath - Path to file to read
 * @param {(line: string) => void} lineCallback - Callback invoked on every line in file
 */
async function readFileByLine(filePath, lineCallback) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    lineCallback(line);
  }
}

module.exports = readFileByLine;
