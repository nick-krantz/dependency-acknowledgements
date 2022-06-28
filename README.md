# Dependency Tables

Add or update existing dependency tables in a project's `README.md`. Each dependency row will include the dependency name (as a link to their npm page), a description and the associated license. 

When a project has existing tables, the existing information is used rather than fetching new information.

Uses [NPM Registry](https://registry.npmjs.org/) API to fetch dependency details.

## Usage

Run the following command from the same level of the project as `package.json` & `README.md`.

```
npx github:nick-krantz/dependency-tables
```

## How it works

1. The script looks for the following format within a project's `README.md` (Example below).
2. If no sections are found matching the format, the user is prompted if they would like to append them. The script exits if the prompt is denied.
3. Using the `dependencies` and `devDependencies` defined in `package.json` each dependency's information is fetched either by:  
  a. The existing table row in `README.md` with the matching name.  
  or  
  b. The dependency information is fetched from [NPM Registry](https://registry.npmjs.org/).  
4. Individual markdown sections & tables in string form are constructed.
5. `README.md` is updated:  
  a. The dependency sections are appended if no sections were found originally (#2).  
  or  
  b. The existing dependency sections are overwritten.

## Markdown Format

```md
## Dependencies 
    
The source of truth for this list is [package.json](./package.json)

### Runtime Dependencies

Name | Description | License 
---- | ----------- | ------- 
[project-name](project-npm-url)|project-description|project-license
<!-- table rows -->


### Development Dependencies

Name | Description | License 
---- | ----------- | ------- 
<!-- table rows -->

```

## TODO

- [ ] Handle cases where only one of `### Development Dependencies` or `### Runtime Dependencies` exists in the README, but the other needs to be added dynamically
