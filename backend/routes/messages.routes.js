const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');

router.get('/conversations/:userId', messagesController.getConversationsByUser);
router.get('/:conversationId', messagesController.getConversationMessages);
router.post('/:conversationId', messagesController.postMessage);

module.exports = router;
