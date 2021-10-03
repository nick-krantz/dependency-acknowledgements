#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const packageJSON = require(process.cwd() + '/package.json');

const basePackageObject = {
  name: '',
  npmLink: '',
  description: '',
  license: '',
}

const tableHeader = 'Name | Description | License \n --- | ----------- | ------- \n';

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
            ...basePackageObject,
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
  let table = tableHeader;
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
## Dependencies 
    
The source of truth for this list is [package.json](./package.json)

### Runtime Dependencies

${runtimeTable}

### Development Dependencies

${devTable}`;
}

/**
 * Write markdown string to ./dependencies.md
 * 
 * @param {string} markdown 
 */
function writeMarkdownToFile(markdown) {
  fs.writeFile("./dependencies.md", markdown, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("wrote to ./dependencies.md");
  });
}

(async () => {
  const { dependencies, devDependencies } = getAllPackages();
  try {
    const runtime = await getAllPackageInformation(dependencies);
    const devDep = await getAllPackageInformation(devDependencies);

    console.log(`Found ${runtime.length} packages in dependencies`);
    console.log(`Found ${devDep.length} packages in dev dependencies`);

    const runtimeTable = createMarkdownTableString(runtime);
    const devTable = createMarkdownTableString(devDep);
    const markdown = createMarkdown(runtimeTable, devTable);

    writeMarkdownToFile(markdown)
  } catch (e) {
    throw new Error(e);
  }
})();
