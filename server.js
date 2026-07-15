import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const app = express()
app.use(cors())
app.use(express.json())

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Endpoint to generate reasoning when a zone exceeds 80% density
app.post('/api/reasoning', async (req, res) => {
  try {
    const { zones, exceedingZones } = req.body

    if (!exceedingZones || exceedingZones.length === 0) {
      return res.json({ decision: null, reasoning: '', action: '' })
    }

    // Build context about zones
    const zoneContext = zones
      .map(
        z =>
          `Zone: ${z.zoneName} (ID: ${z.zoneId}) - Density: ${z.currentDensityPercent}%, Capacity: ${z.capacity}`
      )
      .join('\n')

    const exceedingContext = exceedingZones
      .map(
        z =>
          `${z.zoneName}: ${z.currentDensityPercent}% density (exceeding 80% threshold)`
      )
      .join('\n')

    const prompt = `You are a stadium crowd management AI assistant. Current zones and their densities:

${zoneContext}

ALERT: The following zones are exceeding 80% density:
${exceedingContext}

Based on the zone densities and capacity, provide a JSON response with exactly these three fields:
1. "decision": Which zone should fans be redirected TO (choose a zone under 70% if possible, otherwise the least crowded)
2. "reasoning": Plain-English explanation (2-3 sentences) referencing the specific density numbers and why this decision makes sense
3. "action": A short, clear 1-2 sentence instruction for volunteers to execute

Return ONLY valid JSON with no additional text.`

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    })

    const content = response.text ?? ''

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      res.json(result)
    } else {
      res.json({ decision: null, reasoning: 'Could not parse response', action: '' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/translate', async (req, res) => {
  try {
    const { message, targetLanguage } = req.body

    if (!message || !targetLanguage) {
      return res.status(400).json({ error: 'message and targetLanguage are required' })
    }

    const prompt = `You are a helpful stadium volunteer translator.

Translate the following message into ${targetLanguage} using an appropriate formal and polite register for a tourist context.

Message: "${message}"

Also determine whether the message suggests a general/casual question, a safety concern, or a medical issue. If the message suggests urgency, note that as well. Return ONLY valid JSON with these fields:
- translatedText: the translated text
- contextType: one of 'general', 'medical', 'safety'
- urgencyLevel: one of 'low', 'medium', 'high'
` 

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt
    })

    const content = response.text ?? ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return res.json(result)
    }

    return res.status(500).json({ error: 'Could not parse translation response' })
  } catch (error) {
    console.error('Translate error:', error)
    res.status(500).json({ error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('Make sure GEMINI_API_KEY is set as an environment variable')
})

