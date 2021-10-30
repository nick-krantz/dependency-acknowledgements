const fs = require('fs');
const utils = require('./utils');

/**
 * Append Dependencies section to README.md
 *
 * @param {string} runtimeTable runtime dependency markdown table
 * @param {string} devTable development dependency markdown table
 */
async function appendMarkdownToREADME(runtimeTable, devTable) {
  const markdown = utils.createFullDependencySection(runtimeTable, devTable);

  await fs.appendFileSync('./README.md', markdown);
}

module.exports = appendMarkdownToREADME;
