# Map Implementation Guide

## Overview
The interactive map in Report.np displays all reported civic complaints with location pins. Each pin is color-coded by severity and includes detailed information in popups.

## Key Features

### 1. **Automatic Location Capture**
- When users report an issue on the `/report` page, their location is automatically captured
- Location is obtained using the browser's Geolocation API via the `useLocation` hook
- Location coordinates (latitude, longitude) are stored with each complaint

### 2. **Interactive Map Display**
- Map is displayed on the `/map` page using React-Leaflet
- Uses free OpenStreetMap tiles (no API key required)
- Markers are automatically placed for all complaints with location data

### 3. **Color-Coded Severity Markers**
- **Red** - High severity issues
- **Orange/Amber** - Medium severity issues  
- **Green** - Low severity issues

### 4. **Map Features**
- **Zoom Controls** - Built-in zoom in/out buttons
- **Pan & Scroll** - Drag to move, scroll wheel to zoom
- **Marker Popups** - Click any marker to see complaint details
- **Heatmap Toggle** - Switch between individual markers and heatmap view
- **Current Location** - Button to center map on your location

## How It Works

### Data Flow
```
1. User opens Report page
2. Browser requests location permission
3. Location captured (lat, lng)
4. User fills complaint details
5. Submit → Complaint stored with location
6. Navigate to Map page
7. Map fetches all complaints
8. Renders markers at stored coordinates
```

### Files Involved

**Core Components:**
- `src/pages/MapView.tsx` - Main map component
- `src/pages/Report.tsx` - Report submission with location capture
- `src/hooks/useLocation.tsx` - Custom hook for geolocation
- `src/providers/ComplaintsProvider.tsx` - Complaint data management

**UI Components:**
- `src/components/StatusBadge.tsx` - Status display
- `src/components/IssueTagChip.tsx` - Issue type tags

**Styling:**
- `src/index.css` - Leaflet map styling overrides

### Location Data Structure

Each complaint includes:
```typescript
{
  id: number;
  type: IssueType;
  description: string;
  lat: number;        // Latitude from user's device
  lng: number;        // Longitude from user's device
  location: string;   // Human-readable address
  severity: Severity;
  status: ComplaintStatus;
  // ... other fields
}
```

## Usage

### Viewing the Map
1. Navigate to `/map` or click "Map" in bottom navigation
2. Map loads with all complaint locations
3. Click markers to see details
4. Use zoom controls to zoom in/out
5. Click location button to center on your position

### Reporting an Issue
1. Navigate to `/report` 
2. Location is automatically requested
3. Fill in issue details
4. Click Submit
5. Complaint appears on map immediately

## Technical Details

### Map Library
- **React-Leaflet** - React wrapper for Leaflet.js
- **OpenStreetMap** - Free tile provider
- No API key required for basic usage

### Browser Requirements
- Modern browser with Geolocation API support
- HTTPS connection (required for location services)
- JavaScript enabled

### Performance
- Markers rendered efficiently with React
- Heatmap mode for high-density areas
- Tile caching by browser

## Troubleshooting

### Map shows blank white screen
✅ **FIXED**: Now uses OpenStreetMap tiles without API key requirement

### Location not captured
- Check browser permissions
- Ensure HTTPS connection
- Click the refresh button on Report page

### Markers not showing
- Verify complaints have valid lat/lng values
- Check browser console for errors
- Ensure Leaflet CSS is loaded

## Future Enhancements

Potential improvements:
- Clustering for dense areas
- Filter markers by issue type
- Route navigation to complaint location
- Offline map support
- Custom map styles
