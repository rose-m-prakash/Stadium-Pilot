# StadiumPilot - Live Dashboard with AI Reasoning

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of the `stadiumpilot` directory with your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### 3. Run Both Frontend and Backend

```bash
npm run dev:full
```

This will start:
- **Vite dev server** on `http://localhost:5173` (frontend)
- **Express server** on `http://localhost:3001` (backend for Claude API)

### Or Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

## How It Works

### Dashboard Component
- **Real-time zone monitoring** from Firebase
- **Color-coded status indicators**:
  - 🟢 Green: Under 60% density
  - 🟡 Yellow: 60-80% density  
  - 🔴 Red: Over 80% density
- **Automatic density bar** visualization
- **Four cards displaying**: zone name, density %, capacity, status

### AI Reasoning Module
When any zone exceeds 80% density:
1. **Alerts** the system with a prominent red banner
2. **Calls Claude API** to analyze the situation
3. **Generates a JSON response** with:
   - **Decision**: Which zone to redirect fans to
   - **Reasoning**: Detailed explanation with specific density numbers
   - **Action**: Clear instruction for volunteers

### Zone Data Structure
```json
{
  "zoneId": "zone1",
  "zoneName": "North Upper",
  "currentDensityPercent": 75,
  "capacity": 500,
  "gateId": "gate1",
  "lastUpdated": "2024-07-14T12:30:00Z"
}
```

### CSV Upload
Upload a CSV with columns:
- `zoneId` / `zoneID` / `id` / `zone_id`
- `zoneName` / `zone_name` / `name`
- `currentDensityPercent` / `current_density_percent` / `density`
- `capacity`
- `gateId` / `gate_id` (optional)

Or use the simulation:
```bash
npm run simulate
```

## File Structure

```
stadiumpilot/
├── server.js                    # Express backend for Claude API
├── src/
│   ├── App.jsx                  # Main app with Dashboard
│   ├── firebase.js              # Firebase config & initialization
│   ├── style.css                # Dashboard & component styling
│   ├── main.jsx                 # React entry point
│   └── components/
│       ├── Dashboard.jsx        # Live zone dashboard with reasoning display
│       └── CsvUploader.jsx      # CSV file uploader
└── package.json                 # Dependencies & scripts
```

## Environment

- **Frontend**: React + Vite
- **Backend**: Express.js
- **Database**: Firebase Realtime Database
- **AI**: Claude Opus 4.6 via Anthropic API
- **Real-time Updates**: Firebase onValue listeners

## Troubleshooting

**Server not connecting to frontend:**
- Ensure backend is running on port 3001
- Check ANTHROPIC_API_KEY is set
- Verify Express server started without errors

**No zones appearing:**
- Upload a CSV file or run `npm run simulate`
- Check Firebase connection in console
- Verify zones collection exists in Firebase database

**API errors:**
- Verify ANTHROPIC_API_KEY is valid
- Check Claude API quota/limits in Anthropic console
- Review server logs for error details
