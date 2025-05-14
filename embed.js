require("./init");
const { parseCSV } = require("./utils/csv");
const { getEmbeddings } = require("./utils/openai");
const embeddables = require("./embed-config");
const { getFlagKey, writeFile } = require("./utils/generic");

const embedCSV = async (csvFilename) => {
  const parsed = parseCSV(`./csvs/${csvFilename}.csv`);
  const filteredList = parsed.filter((item) => !!item?.value);
  const mappedList = filteredList.map((item) => item?.value);
  const embeddings = await getEmbeddings(mappedList, 100, 300);
  const list = filteredList.map((item, index) => ({
    ...item,
    embedding: embeddings[index],
  }));
  writeFile(`./data/${csvFilename}.json`, list);
};

const embedJSON = async (embeddableType) => {
  if (!(embeddableType in embeddables)) {
    console.log(
      `Please provide a valid type: ${Object.keys(embeddables).join(", ")}`
    );
    return;
  }

  const embeddable = embeddables[embeddableType];
  const entries = Object.entries(embeddable);
  const embeddableValues = entries
    .filter(([_, { defer }]) => !defer)
    .map(([_, { embed }]) => embed);

  const embeddings = await getEmbeddings(embeddableValues, 100, 300);
  const jsonEmbeddings = entries.reduce(
    (acc, [key], index) => ({ ...acc, [key]: embeddings[index] }),
    {}
  );

  writeFile(`./embeddings/${embeddableType}.json`, jsonEmbeddings);
};

const main = async () => {
  const csvFilename = getFlagKey("--csv");
  const embeddableType = getFlagKey("--json");

  if (!!csvFilename) {
    await embedCSV(csvFilename);
  } else if (!!embeddableType) {
    await embedJSON(embeddableType);
  } else {
    console.log(
      "Please provide a valid argument: --csv [filename] or --json [embeddableType]"
    );
  }
};

main();
