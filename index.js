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

function getAllPackages() {
  const dependencies = Object.keys(packageJSON.dependencies);
  const devDependencies = Object.keys(packageJSON.devDependencies);
  return { dependencies, devDependencies };
}

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

function getAllPackageInformation(dependencies) {
  return new Promise((res, rej) => {
    const promises = [];

    dependencies.forEach((dependency) => {
      promises.push(getNPMPackage(dependency));
    });

    Promise.all(promises).then((packageDetails) => {
      res(packageDetails);
    }).catch((err) => {
      rej(err);
    })
  })
}

function createMarkdownTableString(packageArray) {
  let table = tableHeader;
  packageArray.forEach(p => {
    table += `[${p.name}](${p.npmLink})|${p.description}|${p.license}\n`
  });
  return table;
}

function createMarkdown(runtimeTable, devTable) {
  return `
## Dependencies 
    
The source of truth for this list is [package.json](./package.json)

### Runtime Dependencies

${runtimeTable}

### Development Dependencies

${devTable}`;
}

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
    const runtimeTable = createMarkdownTableString(runtime);
    const devTable = createMarkdownTableString(devDep);
    const markdown = createMarkdown(runtimeTable, devTable);
    writeMarkdownToFile(markdown)
  } catch (e) {
    throw new Error(e);
  }
})();
