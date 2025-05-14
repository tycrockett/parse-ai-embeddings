const fs = require("fs");
const { parse } = require("csv-parse/sync");

function colToChar(col) {
  let letter = "";
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

const getCellRef = (indices) => {
  const [rowIndex, colIndex] = indices;
  return colToChar(colIndex) + (rowIndex + 1);
};

function getCellRefMerge(idx1, idx2) {
  const [r1, c1] = idx1;
  const [r2, c2] = idx2;

  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const maxC = Math.max(c1, c2);

  // diagonal TL→BR? use top-right; otherwise bottom-right
  const row = (r1 - r2) * (c1 - c2) > 0 ? minR : maxR;
  const col = maxC;

  // col-number → letter
  let letter = "";
  for (let n = col; n >= 0; n = Math.floor(n / 26) - 1) {
    letter = String.fromCharCode((n % 26) + 65) + letter;
  }

  return letter + (row + 1);
}

function getCellRefToIndices(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }
  const [, letters, digits] = m;

  // letters → column number (1-based)
  let colNum = 0;
  for (const ch of letters) {
    colNum = colNum * 26 + (ch.charCodeAt(0) - 64);
  }
  const colIndex = colNum - 1; // zero‐based

  // digits → row number
  const rowIndex = parseInt(digits, 10) - 1; // zero‐based

  return [rowIndex, colIndex];
}

function parseCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  // will honor double-quotes, escaped quotes, etc.
  const rows = parse(raw, {
    bom: true, // strip BOM if present
    columns: false, // you’ll get an array of arrays
    skip_empty_lines: true, // ignore blank lines
  });

  const results = [];
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellRef = colToChar(colIndex) + (rowIndex + 1);
      results.push({
        value: cell.trim(),
        indices: [rowIndex, colIndex],
        cell: cellRef,
      });
    });
  });

  return results;
}

function dedupeMatches(list) {
  const seen = new Set();
  return list.filter((item) => {
    if (seen.has(item.cellRef)) return false; // duplicate
    seen.add(item.cellRef);
    return true; // first time we see this pair
  });
}

module.exports = {
  parseCSV,
  getCellRef,
  getCellRefMerge,
  getCellRefToIndices,
  dedupeMatches,
};
