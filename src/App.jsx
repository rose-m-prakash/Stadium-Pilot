import React from 'react'
import CsvUploader from './components/CsvUploader'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div className="container">
      <h1>StadiumPilot</h1>
      <p>CSV upload will override simulated zone data in Firebase Realtime Database.</p>
      <CsvUploader />
      <hr />
      <Dashboard />
    </div>
  )
}
