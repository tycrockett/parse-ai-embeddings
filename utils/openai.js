const { OpenAI } = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be the same length");
  }

  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dot / (magA * magB);
}

function getWeightedEmbedding(items) {
  if (items.length === 0) return [];

  const dim = items[0].embedding.length;
  const sum = new Array(dim).fill(0);
  let totalWeight = 0;

  for (const { embedding, weight } of items) {
    if (embedding.length !== dim) {
      throw new Error("All embedding must have the same length");
    }
    totalWeight += weight;
    for (let i = 0; i < dim; i++) {
      sum[i] += embedding[i] * weight;
    }
  }

  if (totalWeight === 0) {
    throw new Error("Total weight must be > 0");
  }

  return sum.map((v) => v / totalWeight);
}

const getEmbedding = async (text) => {
  const res = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return res.data[0].embedding;
};

const getEmbeddings = async (list, batchSize = 100, delayMs = 300) => {
  const results = [];
  for (let i = 0; i < list.length; i += batchSize) {
    const batch = list.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: batch,
    });
    results.push(...res.data.map((d) => d.embedding));
    await new Promise((res) => setTimeout(res, delayMs)); // avoid rate limit
  }
  return results;
};

function getCellScore(A, B) {
  const [ax, ay] = A;
  const [bx, by] = B;

  // 1) Base score: higher when distance is smaller.
  const distance = Math.hypot(ax - bx, ay - by);
  const baseScore = 1 / (1 + distance);

  // 2) Share score: +2 for matching x, +2 for matching y
  let shareScore = 0;
  if (ax === bx) shareScore += 2;
  if (ay === by) shareScore += 2;

  // 3) Relevance score: +1.5 for each coord in B < A
  let relevanceScore = 0;
  if (bx < ax) relevanceScore += 2;
  if (by < ay) relevanceScore += 2;
  if (bx > ax) relevanceScore -= 4;
  if (by > ay) relevanceScore -= 4;

  // 4) Exponential adjustment
  const multiplier = 2 ** (shareScore + relevanceScore);
  const rawScore = baseScore * multiplier;

  const normalized = rawScore / (1 + rawScore);

  return normalized;
}

function arraysEqual(A, B) {
  if (!Array.isArray(A) || !Array.isArray(B)) return false;
  if (A.length !== B.length) return false;
  return A.every((val, i) => val === B[i]);
}

function mergeCoords(A, B) {
  const [colA] = A;
  const [, rowB] = B;
  return [colA, rowB];
}

module.exports = {
  arraysEqual,
  getCellScore,
  cosineSimilarity,
  getWeightedEmbedding,
  getEmbedding,
  getEmbeddings,
  mergeCoords,
};
