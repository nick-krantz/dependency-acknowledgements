const constants = require('./constants');
const readFileByLine = require('./readFileByLine');
const types = require('./types');
const utils = require('./utils');

/**
 * Boolean that allows or disallows table rows to be processed.
 *
 * See `checkForSectionHeadings`.
 */
let consumeTableRows = false;

/**
 * Boolean that is `true` after a table row has been processed.
 *
 * Set back to `false` after an empty line.
 */
let consumedAtLeastOneRow = false;

/**
 * Object of dependencies.
 *
 * @type {{[name: string]: types.Dependency}}
 */
const dependencies = {};

/**
 * Processes a single line of the file.
 *
 * @param {string} line current line of the file.
 */
function processFileLine(line) {
  // When a line matches a table row & consumingTableRows is true,
  // parse and store row details.
  if (constants.REGEX_TABLE_ROW.test(line) && consumeTableRows) {
    const tableColumns = line.split('|');

    const name = constants.REGEX_DEPENDENCY_NAME.exec(tableColumns[ 0 ])[ 1 ];

    dependencies[ name ] = {
      name,
      npmLink: constants.REGEX_DEPENDENCY_URL.exec(tableColumns[ 0 ])[ 1 ],
      description: tableColumns[ 1 ],
      license: tableColumns[ 2 ],
    };

    consumedAtLeastOneRow = true;
  } else if (consumeTableRows && consumedAtLeastOneRow && line.split('').filter(Boolean).length === 0) {
    // When an empty line is reached & at least one row has been stored, assume the end of the table.
    // Stop consuming the rows.
    consumeTableRows = false;
    consumedAtLeastOneRow = false;
  }
}

/**
 * Read & process `README.md` line by line, returning an object all of dependencies found.
 *
 * @returns {Promise<{[name: string]: types.Dependency}>}
 */
async function getExistingReadmeTables() {
  await readFileByLine('./README.md', (line) => {
    if (utils.isLineAHeading(line)) {
      consumeTableRows = true;
    }
    processFileLine(line);
  });

  return dependencies;
}

module.exports = getExistingReadmeTables;
