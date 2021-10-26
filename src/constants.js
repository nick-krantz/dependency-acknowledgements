const types = require('./types');

/**
 * Regular expression that will match a markdown table row of 3 or more columns.
 * 
 * Ex:
 * ```ts
 *  REGEX_TABLE_ROW.test("Column 1|Column 2|Column 3") // true
 *  REGEX_TABLE_ROW.test("Column 1|Column 2") // false
 * ```
 */
const REGEX_TABLE_ROW = /^(\[.*\])(\(.*\))(\|.*\|)(.*)$/;
/**
 * Regular expression that will match a all characters between two brackets.
 * 
 * Used for parsing a dependency name from markdown syntax.
 */
const REGEX_DEPENDENCY_NAME = /\[(.*?)\]/;

/**
 * Regular expression that will match a all characters between two parenthesis.
 * 
 * Used for parsing a dependency url from markdown syntax.
 */
const REGEX_DEPENDENCY_URL = /\((.*?)\)/;

/**
 * Markdown header of the dependency table.
 * 
 */
const TABLE_HEADER = 'Name | Description | License \n---- | ----------- | ------- \n';


const DEPENDENCY_HEADING = '## Dependencies ';

/**
 * Markdown heading for Runtime Dependencies.
 */
const RUNTIME_DEPENDENCY_HEADING = '### Runtime Dependencies';

/**
 * Markdown heading for Development Dependencies.
 */
const DEVELOPMENT_DEPENDENCY_HEADING = '### Development Dependencies';

/**
 * Empty object that represent all properties of a dependency.
 * 
 * @type {types.Dependency}
 */
const BASE_DEPENDENCY_OBJECT = {
  name: '',
  npmLink: '',
  description: '',
  license: '',
}

module.exports = {
  BASE_DEPENDENCY_OBJECT,
  DEPENDENCY_HEADING,
  DEVELOPMENT_DEPENDENCY_HEADING,
  REGEX_TABLE_ROW,
  REGEX_DEPENDENCY_NAME,
  REGEX_DEPENDENCY_URL,
  RUNTIME_DEPENDENCY_HEADING,
  TABLE_HEADER,
}
