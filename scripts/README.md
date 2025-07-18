# JSON Formatting

Might wanna remove spacing from json files so that they can be smaller in size. 
Or format them for better readability.

- Generate json without spaces

    `jq -c . input.json > output.json`

- Generate json with spaces

    `jq . input.json > output.json`

- Notes
  - Ensure you have `jq` installed to manipulate JSON files.
  - The scripts are designed to be run in a Unix-like environment.
