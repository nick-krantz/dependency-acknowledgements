const packageJSON = require(process.cwd() + '/package.json');
const constants = require('./constants');
const types = require('./types');

/**
 * Retrieves all package names from package.dependencies & package.devDependencies.
 */
function getDependenciesFromPackageJSON() {
  const dependencies = Object.keys(packageJSON.dependencies || {});
  const devDependencies = Object.keys(packageJSON.devDependencies || {});
  return { dependencies, devDependencies };
}

/**
 * Constructs markdown table.
 *
 * @param {types.Dependency[]} packageArray
 * @returns string version of markdown table
 */
function createMarkdownTableString(packageArray) {
  if (packageArray.length === 0) return '';

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
  let markdown = `${constants.DEPENDENCY_HEADING}\n\nThe source of truth for this list is [package.json](./package.json)\n\n`;

  if (runtimeTable) {
    markdown += `${constants.RUNTIME_DEPENDENCY_HEADING}\n\n${runtimeTable}`
  }

  if (devTable) {
    markdown += `${constants.DEVELOPMENT_DEPENDENCY_HEADING}\n\n${devTable}`
  }

  return markdown
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
