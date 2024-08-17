const express = require('express');
const axios = require('axios');
const { MessengerClient } = require('fb-messenger');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;

// Facebook App credentials
const appId = 'APP_ID';
const appSecret = 'APP_SECRET';
const pageToken = 'PAGE_TOKEN';

// OpenAI API credentials
const openaiApiKey = 'OPENAI_API_KEY';

// Set up Messenger client
const client = new MessengerClient(pageToken);

// Set up OpenAI client
const openai = new OpenAI(openaiApiKey);

// Handle incoming messages
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry[0];
  const message = entry.messaging[0].message;
  const senderId = entry.messaging[0].sender.id;

  // Use GPT-4 to generate response
  const response = await openai.complete({
    model: 'gpt-4',
    prompt: message.text,
    maxTokens: 2048,
    temperature: 0.5,
  });

  // Send response
  client.sendMessage(senderId, response.data.choices[0].text);

  res.send('OK');
});

// Verify webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'VERIFY_TOKEN') {
    res.send(challenge);
  } else {
    res.send('OK');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});