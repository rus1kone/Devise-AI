const functions = require('firebase-functions')
const { onRequest } = require('firebase-functions/v2/https')
const OpenAI = require('openai')
const cors = require('cors')({ origin: true }) // ✅ CORS
require('dotenv').config()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

exports.generateChatReply = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { messages } = req.body

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request format' })
      }

      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages,
      })

      res.status(200).json({ reply: completion.data.choices[0].message.content })
    } catch (error) {
      console.error('❌ OpenAI API error:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })
})

