import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { ref, onValue } from 'firebase/database'
import VolunteerTranslator from './VolunteerTranslator'

export default function Dashboard() {
  const [zones, setZones] = useState([])
  const [reasoning, setReasoning] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertActive, setAlertActive] = useState(false)
  const alertActiveRef = useRef(false)
  const lastSnapshotRef = useRef(null)

  // Listen to zones in real-time from Firebase
  useEffect(() => {
    const zonesRef = ref(db, 'zones')
    const unsubscribe = onValue(
      zonesRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const zoneArray = Object.values(data).sort(
            (a, b) => (a.zoneName || '').localeCompare(b.zoneName || '')
          )
          setZones(zoneArray)
          checkForDensityThreshold(zoneArray)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error reading zones:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Check if any zone exceeds 80% and fetch reasoning.
  // Re-fetches when the SET of exceeding zones or their (rounded) values actually
  // changes, not just once per alert episode — otherwise the banner goes stale
  // while the dashboard cards keep updating live.
  const checkForDensityThreshold = async (zoneArray) => {
    const exceedingZones = zoneArray.filter(z => z.currentDensityPercent > 80)

    if (exceedingZones.length > 0) {
      const snapshot = exceedingZones
        .map(z => `${z.zoneId}:${Math.round(z.currentDensityPercent)}`)
        .sort()
        .join(',')

      const changed = snapshot !== lastSnapshotRef.current

      if (!alertActiveRef.current || changed) {
        try {
          const response = await fetch('http://localhost:3001/api/reasoning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zones: zoneArray, exceedingZones })
          })
          const result = await response.json()
          setReasoning(result)
          setAlertActive(true)
          alertActiveRef.current = true
          lastSnapshotRef.current = snapshot
        } catch (error) {
          console.error('Error fetching reasoning:', error)
          setReasoning({
            decision: 'Error',
            reasoning: 'Could not connect to reasoning service',
            action: 'Contact administrator'
          })
          setAlertActive(true)
          alertActiveRef.current = true
        }
      }
    } else {
      if (alertActiveRef.current) {
        setAlertActive(false)
        alertActiveRef.current = false
        lastSnapshotRef.current = null
      }
      setReasoning(null)
    }
  }

  const getStatusColor = (density) => {
    if (density < 60) return '#10b981'
    if (density < 80) return '#f59e0b'
    return '#ef4444'
  }

  if (loading) {
    return <div className="dashboard"><p>Loading zones...</p></div>
  }

  return (
    <div className="dashboard">
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo">SP</div>
          <div>
            <div className="brand-title">StadiumPilot</div>
            <div className="brand-subtitle">Command center for crowd operations</div>
          </div>
        </div>
        <div className="header-meta">Live tracking · AI decision support · Fan safety</div>
      </header>

      <h2 className="section-title">Live Stadium Zone Dashboard</h2>

      {reasoning && (
        <div className="reasoning-alert">
          <div className="reasoning-header">⚠️ CROWD DENSITY ALERT</div>
          <div className="reasoning-content">
            <div className="reasoning-field">
              <strong>Recommended Action:</strong> Redirect to {reasoning.decision}
            </div>
            <div className="reasoning-field">
              <strong>Reasoning:</strong> {reasoning.reasoning}
            </div>
            <div className="reasoning-field">
              <strong>Instructions:</strong> {reasoning.action}
            </div>
          </div>
        </div>
      )}

      <div className="zones-grid">
        {zones.map((zone, idx) => {
          const density = zone.currentDensityPercent || 0
          const statusColor = getStatusColor(density)
          const statusLabel =
            density < 60 ? 'Good' : density < 80 ? 'Caution' : 'Critical'

          return (
            <div
              key={zone.zoneId || idx}
              className="zone-card"
              style={{ borderLeftColor: statusColor }}
            >
              <div className="zone-header">
                <h3>{zone.zoneName}</h3>
                <div
                  className="status-indicator"
                  style={{ backgroundColor: statusColor }}
                  title={statusLabel}
                />
              </div>

              <div className="zone-content">
                <div className="zone-stat">
                  <span className="label">Density:</span>
                  <span className="value">{density}%</span>
                </div>
                <div className="zone-stat">
                  <span className="label">Capacity:</span>
                  <span className="value">{zone.capacity || 0}</span>
                </div>
              </div>

              <div className="density-bar">
                <div
                  className="density-fill"
                  style={{
                    width: `${Math.min(density, 100)}%`,
                    backgroundColor: statusColor
                  }}
                />
              </div>
              <div className="density-label">{statusLabel}</div>
            </div>
          )
        })}
      </div>

      <VolunteerTranslator />

      {zones.length === 0 && <p className="no-zones">No zones data available</p>}
    </div>
  )
}