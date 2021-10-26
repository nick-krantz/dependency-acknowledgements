const fs = require('fs');
const readline = require('readline');
const constants = require('./constants');
const utils = require('./utils');

/**
 * Inserts new Runtime & Development table, overwriting the old tables
 * 
 * @param {*} runtimeTable runtime dependency markdown table
 * @param {*} devTable development dependency markdown table 
 */
async function overwriteExistingDependencyTables(runtimeTable, devTable) {
  const fileStream = fs.createReadStream('./README.md');
  let header;
  let foundTableHeader = false;
  let firstNewLineSkipped = false;
  let newFile = '';

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    // TODO FIX THIS LOGIC
    if (utils.isLineAHeading(line)) {
      foundTableHeader = true;
      header = line === constants.RUNTIME_DEPENDENCY_HEADING ? 'runtime' : 'dev';
      newFile += `${line}\n\n`
      if (header === 'runtime') {
        newFile += `${runtimeTable}\n`
      } else {
        newFile += `${devTable}\n`
      }
      continue;
    }
    if (line.split('').filter(Boolean).length === 0) {
      firstNewLineSkipped = true;
      continue;
    }
    if (foundTableHeader && firstNewLineSkipped && !line.split('').filter(Boolean).length) {
      foundTableHeader = false;
      firstNewLineSkipped = false;
    }
  }

  await fs.writeFileSync('./README.md', newFile)
}

module.exports = overwriteExistingDependencyTables;
