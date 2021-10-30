#!/usr/bin/env node

const appendDependencies = require('./src/appendDependencies');
const fetchAllDependencyInformation = require('./src/fetchAllDependencyInformation');
const getDependenciesFromREADME = require('./src/getDependenciesFromREADME');
const overwriteExistingDependencyTables = require('./src/overwriteExistingDependencyTables');
const promptForNewDependencyTables = require('./src/promptForNewDependencyTables');
const types = require('./src/types');
const utils = require('./src/utils');

/**
 * Existing dependency information from README.
 *
 * Existing information will be used instead of fetching new info.
 *
 * @type {{[name: string]: types.Dependency}}
 */
let existingDependenciesFromREADME = {};

/**
 * When there isn't dependency tables found in the README.md,
 * prompt the user to see if they would like to add them.
 *
 * Options:
 *
 * 1. 'yes' - User wants to append tables to README.md.
 * 2. 'no' - There were existing tables found, overwrite them.
 * 3. 'exit' - There were no existing tables found & user responded no to appending them.
 *
 * @type {types.PromptResponse}
 */
let addDependenciesToREADME;

/**
 * Gathers existing dependency information from README.md.
 *
 * If none are found, prompts the user if they want to add it.
 */
async function checkForExistingDependencyTables() {
  existingDependenciesFromREADME = await getDependenciesFromREADME();
  if (Object.keys(existingDependenciesFromREADME).length === 0) {
    addDependenciesToREADME = await promptForNewDependencyTables();
  } else {
    addDependenciesToREADME = 'no';
  }
}

(async () => {
  try {
    await checkForExistingDependencyTables();

    if (addDependenciesToREADME === 'exit') {
      console.log('No dependency tables were found, and the user selected declined them to be added.');
      console.log('Exiting...');
      return;
    }

    // Fetch all dependency information from package.json
    const { dependencies, devDependencies } = utils.getDependenciesFromPackageJSON();

    // See if any dependencies exist
    if (dependencies.length === 0 && devDependencies.length === 0) {
      console.log('No dependencies found package.json.');
      console.log('Exiting...');
      return;
    }

    // Fetch all dependency information from either existing markdown or the api
    const runtime = await fetchAllDependencyInformation(dependencies, existingDependenciesFromREADME);
    const devDep = await fetchAllDependencyInformation(devDependencies, existingDependenciesFromREADME);


    console.log(`Found ${runtime.length} packages in dependencies.`);
    console.log(`Found ${devDep.length} packages in dev dependencies.`);

    // Create markdown tables for both runtime and development
    const runtimeTable = utils.createMarkdownTableString(runtime);
    const devTable = utils.createMarkdownTableString(devDep);

    if (addDependenciesToREADME === 'yes') {
      await appendDependencies(runtimeTable, devTable);
      console.log('Appended dependency section to README.md.');
    } else if (addDependenciesToREADME === 'no') {
      await overwriteExistingDependencyTables(runtimeTable, devTable);
      console.log('Overwrote dependency tables in README.md.');
    }
  } catch (e) {
    throw new Error(e);
  }
})();
