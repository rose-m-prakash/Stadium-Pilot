# StadiumPilot

A real-time stadium crowd management dashboard powered by Firebase and Claude AI. Monitor zone density, get AI-powered recommendations when crowds get too dense, and manage fan flow with actionable intelligence.

## Features

### 🎯 Live Dashboard
- **Real-time zone monitoring** from Firebase Realtime Database
- **Color-coded status indicators**
  - 🟢 **Green**: Under 60% capacity (Good)
  - 🟡 **Yellow**: 60-80% capacity (Caution)
  - 🔴 **Red**: Over 80% capacity (Critical)
- **Responsive card grid** layout with density visualization
- **Automatic updates** as crowd density changes

### 🤖 AI-Powered Reasoning Module
When any zone exceeds 80% density, the system automatically:
1. Alerts with a **prominent red banner**
2. Analyzes all zone densities using **Claude AI**
3. Generates JSON response with:
   - **Decision**: Which zone to redirect fans to
   - **Reasoning**: Detailed explanation with specific density numbers
   - **Action**: Clear instructions for stadium volunteers

### 📊 Data Management
- **CSV upload** to override zone data
- **Simulated data** generation for testing
- **Firebase integration** for real-time synchronization

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Create a `.env` file:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

Get your key from [console.anthropic.com](https://console.anthropic.com)

### 3. Run the Application

**Option A: Run Both Frontend & Backend Together**
```bash
npm run dev:full
```

**Option B: Run Separately**
```bash
# Terminal 1: Backend Server (port 3001)
npm run server

# Terminal 2: Frontend Dev (port 5173)
npm run dev
```

### 4. Populate Sample Data
```bash
npm run simulate
```

Or upload a CSV file through the app interface.

## CSV Format

Column headers (all optional, but `zoneId` recommended):
- `zoneId` / `zoneID` / `id` / `zone_id`
- `zoneName` / `zone_name` / `name`
- `currentDensityPercent` / `current_density_percent` / `density`
- `capacity`
- `gateId` / `gate_id`

## Architecture

```
┌─────────────────────────────────────────┐
│          React Frontend (Vite)          │
│  ┌──────────────────────────────────┐   │
│  │     Dashboard Component          │   │
│  │  - Displays zones in real-time   │   │
│  │  - Shows reasoning output        │   │
│  └──────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │ HTTP REST API
                 │ /api/reasoning
                 ↓
┌─────────────────────────────────────────┐
│      Express Backend Server             │
│  ┌──────────────────────────────────┐   │
│  │   Claude AI Integration          │   │
│  │  - Analyzes crowd density        │   │
│  │  - Generates decisions & actions │   │
│  └──────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │ Anthropic API
                 ↓
         ┌───────────────┐
         │ Claude Opus   │
         │ (LLM Model)   │
         └───────────────┘

┌─────────────────────────────────────────┐
│    Firebase Realtime Database           │
│  ┌──────────────────────────────────┐   │
│  │  zones/                          │   │
│  │  ├── zone1 {...}                │   │
│  │  ├── zone2 {...}                │   │
│  │  └── zone3 {...}                │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Files

- `server.js` - Express backend with Claude API integration
- `src/components/Dashboard.jsx` - Main dashboard component with real-time updates
- `src/components/CsvUploader.jsx` - CSV file upload interface
- `src/firebase.js` - Firebase configuration
- `src/style.css` - Dashboard styling and responsive layout
- `SETUP.md` - Detailed setup guide

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Express.js
- **Database**: Firebase Realtime Database
- **AI**: Claude Opus 4.6 (Anthropic API)
- **Real-time**: Firebase onValue listeners
- **UI**: CSS Grid & Flexbox

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | API key from Anthropic console |
| `PORT` | No | Backend server port (default: 3001) |

## Troubleshooting

**Dashboard shows no zones:**
- Ensure CSV is uploaded or simulator is running
- Check Firebase connection in browser console

**API reasoning not working:**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Ensure backend server is running on port 3001
- Check network tab for API errors

**Port conflicts:**
- Change backend port: set `PORT=3002` in `.env`
- Change frontend port in Vite config

