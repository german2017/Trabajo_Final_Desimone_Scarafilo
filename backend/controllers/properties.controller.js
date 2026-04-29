const { readData, writeData } = require('../utils/fileDb');

const PROPERTIES_FILE = 'properties.json';

async function getProperties(req, res, next) {
  try {
    const properties = await readData(PROPERTIES_FILE);
    res.json({ success: true, properties });
  } catch (error) {
    next(error);
  }
}

async function getPropertyById(req, res, next) {
  try {
    const { id } = req.params;
    const properties = await readData(PROPERTIES_FILE);
    const property = properties.find((item) => item.id === id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Propiedad no encontrada' });
    }

    res.json({ success: true, property });
  } catch (error) {
    next(error);
  }
}

async function createProperty(req, res, next) {
  try {
    const property = req.body;
    const properties = await readData(PROPERTIES_FILE);
    const newProperty = {
      id: String(Date.now()),
      ...property
    };

    properties.push(newProperty);
    await writeData(PROPERTIES_FILE, properties);
    res.status(201).json({ success: true, property: newProperty });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProperties,
  getPropertyById,
  createProperty
};
