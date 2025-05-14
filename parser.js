require("./init");
const {
  getCellScore,
  cosineSimilarity,
  getWeightedEmbedding,
} = require("./utils/openai");

const propertyValueEmbeddings = require("./embeddings/propertyValues.json");
const propertyChainEmbeddings = require("./embeddings/propertyChains.json");
const utilityEmbeddings = require("./embeddings/utility.json");
const { getCellRefMerge, dedupeMatches } = require("./utils/csv");
const embedConfigs = require("./embed-config");
const { getFlagKey, readFile } = require("./utils/generic");

global.args = process.argv.slice(2);

let config = {
  blacklist: new Set(),
  whitelist: new Set(),
};

const getEmbeddable = (config, embeddings, key, seen = new Set()) => {
  if (seen.has(key)) return null;
  seen.add(key);

  const entry = config[key];
  if (entry === undefined) return null;

  if (typeof entry.defer === "string") {
    return getEmbeddable(config, embeddings, entry.defer, seen);
  }

  if (embeddings != null) {
    if (typeof embeddings.has === "function" && embeddings.has(key)) {
      return embeddings.get(key);
    }

    if (Object.prototype.hasOwnProperty.call(embeddings, key)) {
      return embeddings[key];
    }
  }

  return null;
};

const getContextualEmbedding = (cell, data, options = {}) => {
  const {
    scoreThreshold = 0.6,
    mergedWeight = 0.7,
    returnType = "weighted-average",
    // returnType: 'weighted-average' | 'list'
  } = options;

  const relevantCells = data
    .filter((item) => {
      const score = getCellScore(cell.indices, item.indices);
      return score > scoreThreshold;
    })
    .map((item) => ({
      embedding: item.embedding,
      weight: getCellScore(cell.indices, item.indices),
    }));

  const mergedEmbedding = getWeightedEmbedding(relevantCells);

  if (returnType === "list") {
    return relevantCells.sort((a, b) => b.weight - a.weight);
  } else if (returnType === "weighted-average") {
    const embedding = mergedEmbedding?.length
      ? getWeightedEmbedding([
          { embedding: cell.embedding, weight: 1 },
          { embedding: mergedEmbedding, weight: mergedWeight },
        ])
      : cell.embedding;

    return embedding;
  }
};

const getCellByPlanName = (data, planNames) =>
  planNames.flatMap((name) => data.filter((item) => item.value === name));

const updateACL = (data, planNames) => {
  const planNameCells = getCellByPlanName(data, planNames);

  for (const item of planNameCells) {
    const contextualEmbedding = getContextualEmbedding(item, data, {
      scoreThreshold: 0.7,
    });

    const renewalEmbedding = getEmbeddable(
      embedConfigs.utilities,
      utilityEmbeddings,
      "renewal"
    );

    const similarity = cosineSimilarity(contextualEmbedding, renewalEmbedding);
    if (similarity > 0.85) {
      config.blacklist.add(item.cell);
      break;
    } else {
      config.whitelist.add(item);
    }
  }
};

const scanForPropertyCells = (data) => {
  let properties = {};
  for (const propertyChain in propertyChainEmbeddings) {
    properties[propertyChain] = [];
    for (const cell of data) {
      const embeddingWithContext = getContextualEmbedding(cell, data);

      const propertyEmbeddable = getEmbeddable(
        embedConfigs.propertyChains,
        propertyChainEmbeddings,
        propertyChain
      );
      const similarity = cosineSimilarity(
        embeddingWithContext,
        propertyEmbeddable
      );
      if (similarity > 0.85) {
        properties[propertyChain].push({ cellRef: cell.cell, similarity });
      }
    }
    properties[propertyChain] = properties[propertyChain].sort(
      (a, b) => b.similarity - a.similarity
    );
    properties[propertyChain] = dedupeMatches(properties[propertyChain]);
    properties[propertyChain] = properties[propertyChain].slice(0, 3);
  }

  return properties;
};

const getField = (data, propertyChain, cellA, cellMatch) => {
  if (!cellMatch || !cellA) return null;
  const cellB = data.find((item) => item.cell === cellMatch.cellRef);
  if (!cellB) return null;
  const cellRef = getCellRefMerge(cellA.indices, cellB.indices);
  if (!cellRef) return null;
  const cell = data.find((item) => item.cell === cellRef);
  if (!cell) return null;

  const contextualEmbedding = getContextualEmbedding(cell, data);

  const valueEmbedding = getEmbeddable(
    embedConfigs.propertyValues,
    propertyValueEmbeddings,
    propertyChain
  );

  if (!valueEmbedding) return null;

  const similarity = cosineSimilarity(contextualEmbedding, valueEmbedding);
  const filterFn = embedConfigs?.propertyValues[propertyChain].filter;
  const value = filterFn ? filterFn?.(cell?.value) : cell?.value;
  return {
    averageSimilarity: (similarity * 3 + cellMatch.similarity) / 4,
    value,
    cellRef,
    fieldSimilarity: similarity,
    header: {
      ...cellMatch,
      value: cellB.value,
    },
  };
};

const getProperties = (planCell, propertyCells, data) => {
  let properties = {};
  for (const propertyChain in propertyCells) {
    const propertyMatches = propertyCells[propertyChain];

    let fields = [];
    for (const match of propertyMatches) {
      const field = getField(data, propertyChain, planCell, match);
      if (field) {
        fields.push(field);
      }
    }

    properties[propertyChain] = fields.sort(
      (a, b) => b.averageSimilarity - a.averageSimilarity
    );
  }
  return properties;
};

const main = async () => {
  const dataFilename = getFlagKey("--data");
  console.log("Data filename:", dataFilename);
  const filename = `./data/${dataFilename}.json`;
  const data = readFile(filename);

  // TODO: Grab plan names

  // node parser --data:gce-medical
  const planNames = ["Anthem Classic HMO 10/30/250 admit/125"];

  // node parser --data:fjm-medical
  // const planNames = ["Traditional Plan"];

  updateACL(data, planNames);

  const planNameCell = config.whitelist.values().next().value;
  const propertyCells = scanForPropertyCells(data);

  if (!planNameCell) {
    console.log("No plan name cell found");
    return;
  }

  console.log("Scanned Property cells");
  console.log(propertyCells);

  console.log();
  console.log("PLAN VALUES --------------------");
  const properties = getProperties(planNameCell, propertyCells, data);
  console.log(properties);
};

main();
