Add `.env` in root, add your `OPENAI_API_KEY`.
Run `npm i`

New CSV:

1. Add csv to the `/csvs/` folder
2. `node embed --csv:[filename]`
3. `node parser --data:[filename]`
*filename without the extension

Updating embed configs (propertyChains, propertyValues, utilities)

1. `node embed --json:propertyChains`
