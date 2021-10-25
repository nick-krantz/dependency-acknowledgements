const fs = require('fs');
const readline = require('readline');
const constants = require('./constants')

/**
 * Boolean that allows or disallows table rows to be processed. 
 * 
 * See `checkForSectionHeadings`.
 */
let allowRowProcessing = false;

/**
 * Boolean that is `true` after a table row has been processed.
 * 
 * Set back to `false` after an empty line. 
 */
let processedAtLeastOneRow = false;


/**
 * Object of dependencies.
 * 
 * Key is dependency name & the value is the dependency properties.
 */
const dependencies = {}

/**
 * Sets `allowRowProcessing` if the input line is equal to the Runtime or Development heading.
 * 
 * Ensures that only tables that are under the Runtime or Development headings are processed.
 * 
 * @param {string} line current line of the file.
 */
function checkForSectionHeadings(line) {
  if (line === constants.RUNTIME_DEPENDENCY_HEADING || line === constants.DEVELOPMENT_DEPENDENCY_HEADING) {
    allowRowProcessing = true;
  }
}

/**
 * Processes a single line of the file.
 * 
 * @param {string} line current line of the file.
 */
function processFileLine(line) {
  // When a line matches a table row & processing is allowed, store all of the dependency values
  if (constants.REGEX_TABLE_ROW.test(line) && allowRowProcessing) {
    const tableColumns = line.split('|');
    const name = constants.REGEX_DEPENDENCY_NAME.exec(tableColumns[ 0 ])[ 1 ];
    dependencies[ name ] = {
      ...constants.BASE_DEPENDENCY_OBJECT,
      name,
      npmLink: constants.REGEX_DEPENDENCY_URL.exec(tableColumns[ 0 ])[ 1 ],
      description: tableColumns[ 1 ],
      license: tableColumns[ 2 ]
    }
    processedAtLeastOneRow = true;
  } else if (allowRowProcessing && processedAtLeastOneRow && line.split('').filter(Boolean).length === 0) {
    // When a line is empty & at least one row has been processed, this assumes the table is complete. 
    // Stop processing.
    allowRowProcessing = false;
    processedAtLeastOneRow = false;
  }
}

/**
 * Read & process `README.md` line by line, returning an object all of dependencies found.
 */
async function getExistingPackages() {
  const fileStream = fs.createReadStream('./README.md');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    checkForSectionHeadings(line);
    processFileLine(line);
  }

  return dependencies;
}

module.exports = getExistingPackages
