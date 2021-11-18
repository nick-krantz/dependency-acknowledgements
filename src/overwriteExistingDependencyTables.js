const fs = require('fs');
const readline = require('readline');
const constants = require('./constants');
const utils = require('./utils');
const readFileByLine = require('./readFileByLine');

/**
 * Inserts new Runtime & Development table, overwriting the old tables.
 * Old table rows are processed but not added to the `newFile`.
 *
 * @param {string} runtimeTable runtime dependency markdown table
 * @param {string} devTable development dependency markdown table
 */
async function overwriteExistingDependencyTables(runtimeTable, devTable) {
  let skipOldTableRows = false;
  let numberOfEmptyLines = 0;
  let newFile = '';

  await readFileByLine('./README.md', (line) => {
    // When a line is a dependency heading, insert the corresponding table beneath it.
    if (utils.isLineAHeading(line)) {
      skipOldTableRows = true;
      numberOfEmptyLines = 0;

      // Add heading to new file
      newFile += `${line}\n\n`;

      // Add the corresponding dependency table to new file string
      if (line === constants.RUNTIME_DEPENDENCY_HEADING && runtimeTable) {
        newFile += `${runtimeTable}\n`;
        return;
      }

      if (line === constants.DEVELOPMENT_DEPENDENCY_HEADING && devTable) {
        newFile += `${devTable}\n`;
        return;
      }

      // Skip to next line (shouldn't get to here, one of the above statements should be true)
      return;
    }

    // When skipping old table rows
    if (skipOldTableRows) {
      // If there have been 2 empty lines, that assumes the end of the table
      // Reset tracking variables
      if (numberOfEmptyLines >= 2) {
        numberOfEmptyLines = 0;
        skipOldTableRows = false;
        newFile += `${line}\n`;
        return;
      }

      // If the line is empty, increase the counter
      if (line.split('').filter(Boolean).length === 0) {
        numberOfEmptyLines++;
        return;
      }
    } else {
      // Add line to file
      newFile += `${line}\n`;
    }
  });

  await fs.writeFileSync('./README.md', newFile);
}

module.exports = overwriteExistingDependencyTables;
