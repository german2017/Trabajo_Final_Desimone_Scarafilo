const { readData, writeData } = require('../utils/fileDb');

const MESSAGES_FILE = 'messages.json';

async function getConversationsByUser(req, res, next) {
  try {
    const { userId } = req.params;
    const messages = await readData(MESSAGES_FILE);
    const conversations = messages.filter((item) => item.participants.includes(userId));
    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    const { conversationId } = req.params;
    const messages = await readData(MESSAGES_FILE);
    const conversation = messages.find((item) => item.id === conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
}

async function postMessage(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { senderId, text } = req.body;
    const messages = await readData(MESSAGES_FILE);
    const conversation = messages.find((item) => item.id === conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
    }

    const newMessage = {
      id: String(Date.now()),
      senderId,
      text,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(newMessage);
    await writeData(MESSAGES_FILE, messages);
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getConversationsByUser,
  getConversationMessages,
  postMessage
};
