import React, { useState } from 'react'
import Papa from 'papaparse'
import { db } from '../firebase'
import { ref, get, set, push } from 'firebase/database'

const normalize = (str) => (str || '').toString().trim().toLowerCase().replace(/\s+/g, ' ')

export default function CsvUploader() {
  const [status, setStatus] = useState('')

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setStatus('Parsing...')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data
        let skipped = 0
        try {
          const existingSnap = await get(ref(db, 'zones'))
          const existing = existingSnap.val() || {}
          const nameLookup = {}
          Object.keys(existing).forEach((key) => {
            const z = existing[key]
            const name = normalize(z.zoneName)
            if (name) nameLookup[name] = { key, data: z }
          })

          for (const row of rows) {
            const csvName = (row.zoneName || row.zone_name || row.name || '').toString().trim()
            if (!csvName) {
              console.warn('Skipping row: missing zone name', row)
              skipped++
              continue
            }
            const norm = normalize(csvName)
            console.log('CSV row zoneName:', JSON.stringify(csvName), '-> normalized:', JSON.stringify(norm), '| Available lookup keys:', JSON.stringify(Object.keys(nameLookup)))

            const rawDensity = row.currentDensityPercent ?? row.current_density_percent ?? row.density
            let currentDensity = Number(rawDensity)

            if (rawDensity === undefined || rawDensity === '' || isNaN(currentDensity)) {
              console.warn(`Skipping row "${csvName}": invalid density value "${rawDensity}"`)
              skipped++
              continue
            }

            currentDensity = Math.min(100, Math.max(0, currentDensity))

            const capacity = Number(row.capacity || 0)
            const gateId = row.gateId || row.gate_id || ''

            const match = nameLookup[norm]
            if (match) {
              const key = match.key
              const existingData = match.data || {}
              const dataToWrite = {
                ...existingData,
                currentDensityPercent: currentDensity,
                capacity,
                gateId,
                lastUpdated: new Date().toISOString()
              }
              await set(ref(db, `zones/${key}`), dataToWrite)
            } else {
              const newRef = push(ref(db, 'zones'))
              const newKey = newRef.key
              const dataToWrite = {
                zoneId: newKey,
                zoneName: csvName,
                gateId,
                currentDensityPercent: currentDensity,
                capacity,
                lastUpdated: new Date().toISOString()
              }
              await set(newRef, dataToWrite)
            }
          }
          setStatus(skipped > 0 ? `Upload complete (${skipped} row(s) skipped — see console)` : 'Upload complete')
        } catch (err) {
          console.error(err)
          setStatus('Error writing to database')
        }
      },
      error: (err) => {
        console.error(err)
        setStatus('Parse error')
      }
    })
  }

  return (
    <div className="uploader">
      <label>
        Upload CSV to override zones data:
        <input type="file" accept="text/csv" onChange={handleFile} />
      </label>
      <div>{status}</div>
    </div>
  )
}