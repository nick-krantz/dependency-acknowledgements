#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const readline = require('readline');
const packageJSON = require(process.cwd() + '/package.json');
const constants = require('./constants');
const getExistingPackages = require('./getExistingPackages');

let existingREADMEInfo = {}

async function promptForNewDependencyTables() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(function (resolve, reject) {
    console.log('There were no dependencies found in the README.md');
    rl.question('Would you like to append the dependency tables to README.md? (Y/N) ', async function (userInput) {
      rl.close();

      const answer = userInput.trim().toLowerCase();
      if (answer === '') {
        return resolve(true);

      }

      if (answer === 'y' || answer === 'yes') {
        return resolve(true);
      }

      if (answer === 'n' || answer === 'no') {
        return resolve(false);
      }
    });
  });
}

/**
 * Retrieves all package names from package.dependencies & package.devDependencies
 * 
 * @returns Object of arrays with dependencies & dev dependencies names
 */
function getAllPackages() {
  const dependencies = Object.keys(packageJSON.dependencies);
  const devDependencies = Object.keys(packageJSON.devDependencies);
  return { dependencies, devDependencies };
}

/**
 * Uses npms.io API to fetch package information
 * 
 * @param {string} packageName 
 * @returns Promise that resolves to package information object
 */
function getNPMPackage(packageName) {
  return new Promise((resolve, reject) => {

    // If the README already contained package information, return it.
    if (existingREADMEInfo[ packageName ]) {
      resolve(existingREADMEInfo[ packageName ]);
      return;
    }

    https.get(`https://api.npms.io/v2/package/${encodeURIComponent(packageName)}`, (res) => {
      let data = [];

      res.on('data', chunk => {
        data.push(chunk);
      });

      res.on('end', () => {
        const response = JSON.parse(Buffer.concat(data).toString());
        if (!response.code) {
          resolve({
            name: response.collected.metadata.name,
            npmLink: decodeURIComponent(response.collected.metadata.links.npm),
            description: response.collected.metadata.description,
            license: response.collected.metadata.license,
          })
        } else {
          console.warn('Could not find: ', packageName)
          resolve({
            ...constants.BASE_DEPENDENCY_OBJECT,
            name: packageName
          })
        }
      });
    }).on('error', err => {
      reject(err);
    });
  })
}

/**
 * Constructs Promise array containing individual request for each package
 * 
 * @param {string[]} packages 
 * @returns Promise.all for all packages
 */
function getAllPackageInformation(packages) {
  const promises = [];

  packages.forEach((package) => {
    promises.push(getNPMPackage(package));
  });

  return Promise.all(promises).then((packageDetails) => {
    return (packageDetails);
  })
}

/**
 * Constructs markdown table
 * 
 * @param {*} packageArray 
 * @returns string version of markdown table
 */
function createMarkdownTableString(packageArray) {
  let table = constants.TABLE_HEADER;
  packageArray.forEach(p => {
    table += `[${p.name}](${p.npmLink})|${p.description}|${p.license}\n`
  });
  return table;
}

/**
 * Constructs full content of dependencies.md
 * 
 * @param {*} runtimeTable runtime dependency markdown table
 * @param {*} devTable development dependency markdown table
 * @returns 
 */
function createMarkdown(runtimeTable, devTable) {
  return `
${constants.DEPENDENCY_HEADING}
    
The source of truth for this list is [package.json](./package.json)

${constants.RUNTIME_DEPENDENCY_HEADING}

${runtimeTable}

${constants.DEVELOPMENT_DEPENDENCY_HEADING}

${devTable}`;
}

/**
 * Append full dependency markdown to README.md
 * 
 * @param {string} markdown 
 */
function appendMarkdownToREADME(markdown) {
  fs.appendFile("./README.md", markdown, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("appended dependency tables to ./README.md");
  });
}

(async () => {
  let addDependenciesToREADME = false;
  const { dependencies, devDependencies } = getAllPackages();
  try {
    existingREADMEInfo = await getExistingPackages();
    if (Object.keys(existingREADMEInfo)) {
      addDependenciesToREADME = await promptForNewDependencyTables();
    }
    const runtime = await getAllPackageInformation(dependencies);
    const devDep = await getAllPackageInformation(devDependencies);

    console.log(`Found ${runtime.length} packages in dependencies`);
    console.log(`Found ${devDep.length} packages in dev dependencies`);

    if (addDependenciesToREADME) {
      const runtimeTable = createMarkdownTableString(runtime);
      const devTable = createMarkdownTableString(devDep);
      const markdown = createMarkdown(runtimeTable, devTable);

      appendMarkdownToREADME(markdown)
    }


  } catch (e) {
    throw new Error(e);
  }
})();
