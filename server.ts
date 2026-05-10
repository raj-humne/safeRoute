import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "SafeRoute Backend" });
  });

  // Realistic distance calculation (Haversine semi-accurate for small distances)
  function calculateDistance(start: any, end: any) {
    const lat1 = start.lat, lon1 = start.lng;
    const lat2 = end.lat, lon2 = end.lng;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Mock Routing Engine logic
  app.post("/api/route/safest", (req, res) => {
    const { start, end, safetyReports = [] } = req.body;
    
    const trueDistance = calculateDistance(start, end);
    // Path factor to simulate street turns increase distance by ~30%
    const realisticDistance = trueDistance * 1.32; 
    
    // Count danger reports near the hypothetical route
    const dangerCount = safetyReports.filter((r: any) => r.type === 'danger').length;
    const safetyCount = safetyReports.filter((r: any) => r.type === 'safety').length;
    
    const safetyScore = Math.min(100, Math.max(40, 95 - (dangerCount * 6) + (safetyCount * 2)));
    const travelTimeMinutes = Math.round(realisticDistance * 12); // ~5km/h walking speed
    
    // Generate a "Street-Follow" Path 
    // Instead of simple zig-zag, we simulate "Main Streets" behavior
    const coords = [];
    coords.push([start.lng, start.lat]);
    
    // We'll create 5 main "waypoints" then add minor segments
    let currentLng = start.lng;
    let currentLat = start.lat;
    
    const waypoints = 6;
    for (let i = 1; i < waypoints; i++) {
        const progress = i / waypoints;
        const targetLng = start.lng + (end.lng - start.lng) * progress;
        const targetLat = start.lat + (end.lat - start.lat) * progress;
        
        // Deviate slightly to "evade" danger or follow "safe segments"
        const deviation = 0.0008;
        const lngWithDev = targetLng + (Math.random() - 0.5) * deviation;
        const latWithDev = targetLat + (Math.random() - 0.5) * deviation;
        
        coords.push([lngWithDev, latWithDev]);
    }
    
    coords.push([end.lng, end.lat]);
    
    res.json({
      type: "Feature",
      properties: {
        distance: `${realisticDistance.toFixed(2)} km`,
        safetyScore: safetyScore,
        estimatedTime: `${travelTimeMinutes} mins`,
        dangerZonesAvoided: dangerCount,
        safetyBonus: safetyCount
      },
      geometry: {
        type: "LineString",
        coordinates: coords
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
