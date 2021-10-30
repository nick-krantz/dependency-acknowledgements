const packageJSON = require(process.cwd() + '/package.json');
const constants = require('./constants');
const types = require('./types');

/**
 * Retrieves all package names from package.dependencies & package.devDependencies.
 */
function getDependenciesFromPackageJSON() {
  const dependencies = Object.keys(packageJSON.dependencies);
  const devDependencies = Object.keys(packageJSON.devDependencies);
  return { dependencies, devDependencies };
}

/**
 * Constructs markdown table.
 *
 * @param {types.Dependency[]} packageArray
 * @returns string version of markdown table
 */
function createMarkdownTableString(packageArray) {
  let table = constants.TABLE_HEADER;
  packageArray.forEach((p) => {
    table += `[${p.name}](${p.npmLink})|${p.description}|${p.license}\n`;
  });
  return table;
}

/**
 * Constructs entire section for dependencies
 *
 * @param {string} runtimeTable runtime dependency markdown table
 * @param {string} devTable development dependency markdown table
 */
function createFullDependencySection(runtimeTable, devTable) {
  return `
${constants.DEPENDENCY_HEADING}
    
The source of truth for this list is [package.json](./package.json)

${constants.RUNTIME_DEPENDENCY_HEADING}

${runtimeTable}
${constants.DEVELOPMENT_DEPENDENCY_HEADING}

${devTable}`;
}

/**
 * Checks if current line is one of the heading lines.
 *
 * @param {string} line
 */
function isLineAHeading(line) {
  return line === constants.RUNTIME_DEPENDENCY_HEADING || line === constants.DEVELOPMENT_DEPENDENCY_HEADING;
}

module.exports = {
  createFullDependencySection,
  createMarkdownTableString,
  getDependenciesFromPackageJSON,
  isLineAHeading,
};
