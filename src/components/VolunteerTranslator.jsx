import React, { useState } from 'react'

const languageOptions = [
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'French', label: 'French' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Hindi', label: 'Hindi' }
]

const quickPhrases = [
  'Where do you need to go?',
  'Are you injured or need medical help?',
  'This area is closed, please follow me',
  'Can I see your ticket?'
]

const getBadgeStyle = (contextType, urgencyLevel) => {
  if (urgencyLevel === 'high' && (contextType === 'medical' || contextType === 'safety')) {
    return { backgroundColor: '#dc2626', color: '#fff' }
  }
  if (urgencyLevel === 'medium') {
    return { backgroundColor: '#f59e0b', color: '#000' }
  }
  return { backgroundColor: '#10b981', color: '#fff' }
}

export default function VolunteerTranslator() {
  const [message, setMessage] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('Spanish')
  const [translatedText, setTranslatedText] = useState('')
  const [contextType, setContextType] = useState('general')
  const [urgencyLevel, setUrgencyLevel] = useState('low')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePresetClick = (phrase) => {
    setMessage(phrase)
    setError(null)
  }

  const handleTranslate = async () => {
    if (!message.trim()) {
      setError('Please enter a message to translate.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, targetLanguage })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Translation failed')
      }

      setTranslatedText(result.translatedText || '')
      setContextType(result.contextType || 'general')
      setUrgencyLevel(result.urgencyLevel || 'low')
    } catch (fetchError) {
      console.error('Translation error:', fetchError)
      setError(fetchError.message || 'Unable to translate message')
      setTranslatedText('')
      setContextType('general')
      setUrgencyLevel('low')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="translator-panel">
      <h3>Volunteer Translator</h3>
      <div className="translator-controls">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message for translation"
          rows={4}
        />
        <div className="translator-action-row">
          <select
            value={targetLanguage}
            onChange={(event) => setTargetLanguage(event.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleTranslate} disabled={loading}>
            {loading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </div>

      <div className="translator-presets">
        {quickPhrases.map((phrase) => (
          <button
            key={phrase}
            type="button"
            className="preset-button"
            onClick={() => handlePresetClick(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>

      {error && <div className="translator-error">{error}</div>}

      {translatedText && (
        <div className="translator-result">
          <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>{translatedText}</div>
          <span className="translator-badge" style={getBadgeStyle(contextType, urgencyLevel)}>
            {contextType.toUpperCase()} · {urgencyLevel.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  )
}
