const fs = require('fs').promises;
const path = require('path');

const dataPath = (filename) => path.join(__dirname, '../data', filename);

async function readData(filename) {
  const file = dataPath(filename);
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(filename, data) {
  const file = dataPath(filename);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readData,
  writeData
};
