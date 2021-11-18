const readline = require('readline');
const types = require('./types');

/**
 * Used when no dependencies have been found.
 * Prompts the user via the command line, asking if they want to append dependency tables to the README.
 *
 * Resolves to true/false if tables should be appended to the README.
 *
 * @returns {Promise<types.PromptResponse>}
 */
async function promptForNewDependencyTables() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(function (resolve) {
    console.log('There were no dependencies found in the README.md');
    rl.question('Would you like to append the dependency tables to README.md? (Y/N) ', async function (userInput) {
      rl.close();

      const answer = userInput.trim().toLowerCase();
      if (answer === '') {
        return resolve('yes');
      }

      if (answer === 'y' || answer === 'yes') {
        return resolve('yes');
      }

      if (answer === 'n' || answer === 'no') {
        return resolve('exit');
      }
    });
  });
}

module.exports = promptForNewDependencyTables;
