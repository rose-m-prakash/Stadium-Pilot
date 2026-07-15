import { db } from './src/firebase.js'
import { ref, set } from 'firebase/database'

// Six zones with initial values and trending direction
const zones = [
  { zoneId: '1', zoneName: 'North Stand', gateId: 'A', current: 25, trend: 1, capacity: 1000 },
  { zoneId: '2', zoneName: 'South Stand', gateId: 'B', current: 70, trend: -1, capacity: 1200 },
  { zoneId: '3', zoneName: 'East Terrace', gateId: 'C', current: 45, trend: 1, capacity: 800 },
  { zoneId: '4', zoneName: 'West Terrace', gateId: 'D', current: 55, trend: -1, capacity: 900 },
  { zoneId: '5', zoneName: 'VIP Box', gateId: 'E', current: 10, trend: 1, capacity: 200 },
  { zoneId: '6', zoneName: 'Concourse', gateId: 'F', current: 40, trend: 0, capacity: 1500 }
]

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)))
}

async function writeZone(z) {
  const payload = {
    zoneId: z.zoneId,
    zoneName: z.zoneName,
    gateId: z.gateId,
    currentDensityPercent: clamp(z.current),
    capacity: z.capacity,
    lastUpdated: new Date().toISOString()
  }
  await set(ref(db, `zones/${z.zoneId}`), payload)
}

// seed initial values
async function seed() {
  for (const z of zones) {
    await writeZone(z)
  }
}

seed().then(() => console.log('Initial zones seeded'))

// every 5 seconds update each zone with realistic fluctuation
setInterval(async () => {
  for (const z of zones) {
    const trendDelta = (z.trend || 0) * (Math.random() * 4)
    const randomDelta = (Math.random() - 0.5) * 6
    const occasional = Math.random() < 0.05 ? (Math.random() - 0.5) * 30 : 0

    z.current = z.current + trendDelta + randomDelta + occasional
    if (Math.random() < 0.2) z.trend *= 0.9

    z.current = clamp(z.current)
    try {
      await writeZone(z)
      console.log(`Updated zone ${z.zoneId}: ${z.current}%`)
    } catch (err) {
      console.error('Write error', err)
    }
  }
}, 5000)