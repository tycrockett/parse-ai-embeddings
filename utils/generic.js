const fs = require("fs");

const getFlagKey = (property) => {
  const flag = global.args.find((arg) => arg.startsWith(property));
  if (!flag) {
    return "";
  }
  const key = flag.split(":").slice(1).join(":");
  return key;
};

const readFile = (filename) => {
  const raw = fs.readFileSync(filename, "utf8");
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    console.error("Invalid JSON:", e);
  }
  return obj;
};

const writeFile = (filename, data) => {
  let content;

  if (Buffer.isBuffer(data) || typeof data === "string") {
    content = data;
  } else {
    content = JSON.stringify(data, null, 2);
  }

  try {
    fs.writeFileSync(filename, content);
    // console.log(`Wrote ${filename}`);
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    throw err;
  }
};

module.exports = {
  getFlagKey,
  readFile,
  writeFile,
};
