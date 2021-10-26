const constants = require('./constants');
const https = require('https');
const types = require('./types');

/**
 * Uses npms.io API to fetch dependency information
 * 
 * @param {string} dependencyName 
 * @returns {Promise<types.Dependency>}
 */
function getNPMPackage(dependencyName, existingDependencyInfo) {
  return new Promise((resolve, reject) => {

    // If the README already contained dependency information, return it.
    if (existingDependencyInfo) {
      resolve(existingDependencyInfo);
      return;
    }

    // Fetch dependency information from NPMS.
    https.get(`https://api.npms.io/v2/package/${encodeURIComponent(dependencyName)}`, (res) => {
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
          console.warn('Could not find: ', dependencyName)
          // Resolve empty dependency if one cannot be found
          resolve({
            ...constants.BASE_DEPENDENCY_OBJECT,
            name: dependencyName
          })
        }
      });
    }).on('error', err => {
      reject(err);
    });
  })
}

/**
 * Fetches information for every dependency.
 * 
 * @param {string[]} dependencyNames
 * @param {{[name: string]: types.Dependency}} existingDependencyInfo
 * @returns {Promise<types.Dependency[]>}
 */
function fetchAllDependencyInformation(dependencyNames, existingDependencyInfo) {
  const promises = [];

  dependencyNames.forEach((name) => {
    promises.push(getNPMPackage(name, existingDependencyInfo[ name ]));
  });

  return Promise.all(promises).then((packageDetails) => {
    return (packageDetails);
  })
}


module.exports = fetchAllDependencyInformation
