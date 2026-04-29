const express = require('express');
const router = express.Router();
const propertiesController = require('../controllers/properties.controller');

router.get('/', propertiesController.getProperties);
router.get('/:id', propertiesController.getPropertyById);
router.post('/', propertiesController.createProperty);

module.exports = router;
