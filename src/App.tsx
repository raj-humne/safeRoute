import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MapComponent from "./components/MapComponent";
import Sidebar from "./components/Sidebar";
import ReportingModal from "./components/ReportingModal";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Phone, MapPin, X } from "lucide-react";
import { getReports, submitReport, fetchSafestRoute, triggerSOS, Report } from "./services/api";

function SafeRouteApp() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [activeRoute, setActiveRoute] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sosStatus, setSosStatus] = useState<'idle' | 'triggered'>('idle');
  const [center, setCenter] = useState<[number, number]>([18.5204, 73.8567]); // Default: Pune, India

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      try {
        unsubscribe = getReports(setReports);
      } catch (error) {
        console.error("Failed to initialize reports listener:", error);
      }
    } else {
      setReports([]);
    }
    
    // Watch user location
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(newLoc);
          // Only auto-center if not navigating or if it's the first fix
          if (!userLocation) {
            setCenter(newLoc);
          }
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  const handleRecenter = () => {
    if (userLocation) {
      setCenter([...userLocation]);
    }
  };

  const handleStartNavigation = () => {
    if (activeRoute) {
      setIsNavigating(true);
    }
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setActiveRoute(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setIsReporting(true);
  };

  const handleSearch = async (start: string, destination: string) => {
    setLoading(true);
    
    let startCoords = { lat: center[0], lng: center[1] };
    if (start.toLowerCase() === "my location" && userLocation) {
      startCoords = { lat: userLocation[0], lng: userLocation[1] };
    }

    // Mock destination selection (in a real app, this would use geocoding)
    const destCoords = { lat: startCoords.lat + (Math.random() - 0.5) * 0.02, lng: startCoords.lng + (Math.random() - 0.5) * 0.02 };
    const route = await fetchSafestRoute(
      startCoords,
      destCoords,
      reports
    );
    setActiveRoute(route);
    setLoading(false);
    if (route) {
      setCenter([destCoords.lat, destCoords.lng]);
    }
  };

  const handleReportSubmit = async (data: any) => {
    if (!user || !selectedLocation) return;
    await submitReport(user.uid, { ...data, ...selectedLocation });
    setIsReporting(false);
    setSelectedLocation(null);
  };

  const handleSOS = async () => {
    if (!user) {
      alert("⚠️ LOGIN REQUIRED: Please sign in to trigger an SOS alert so we can identify you to emergency services.");
      return;
    }
    
    if (sosStatus === 'triggered') {
      if (confirm("Reset SOS alert?")) {
        setSosStatus('idle');
      }
      return;
    }

    setSosStatus('triggered');
    
    try {
      await triggerSOS(user.uid, center[0], center[1]);
      // Also simulate a browser notification if possible
      console.log("SOS TRIGGERED at", center);
    } catch (err) {
      console.error("SOS failed:", err);
      setSosStatus('idle');
      alert("❌ SOS signal failed. Please check your data connection or call 911/emergency services directly.");
    }
  };

  return (
    <div className="relative h-screen w-screen bg-cyber-dark text-white overflow-hidden">
      <Sidebar 
        onSearch={handleSearch} 
        activeRoute={activeRoute} 
        loading={loading} 
        reports={reports} 
        isNavigating={isNavigating}
        onRecenter={handleRecenter}
        onStartNavigation={handleStartNavigation}
        onStopNavigation={handleStopNavigation}
        onSOS={handleSOS}
        sosStatus={sosStatus}
      />
      
      <main className="h-full w-full">
        <MapComponent 
          center={center} 
          userLocation={userLocation}
          zoom={14} 
          onMapClick={handleMapClick}
          reports={reports}
          activeRoute={activeRoute}
        />
      </main>

      {/* Floating SOS Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSOS}
        className={`fixed bottom-8 right-8 z-40 w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold shadow-2xl transition-all ${
          sosStatus === 'triggered' 
            ? 'bg-red-600 animate-pulse' 
            : 'bg-gradient-to-tr from-red-600 to-orange-600 shadow-red-500/30'
        }`}
      >
        <Phone size={32} />
        <span className="text-[10px] tracking-widest mt-1">SOS</span>
      </motion.button>

      {/* SOS Alert UI */}
      <AnimatePresence>
        {sosStatus === 'triggered' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 right-8 z-40 glass-card p-4 border-red-500/50 w-72"
          >
            <div className="flex items-center gap-3 text-red-500 mb-2">
              <AlertCircle size={20} className="animate-spin" />
              <span className="font-bold">EMERGENCY ACTIVATED</span>
            </div>
            <p className="text-sm text-gray-300">
              Your location is being shared with emergency contacts and police.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-gray-400">
              <MapPin size={12} />
              {center[0].toFixed(5)}, {center[1].toFixed(5)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReportingModal 
        isOpen={isReporting} 
        onClose={() => setIsReporting(false)}
        coordinates={selectedLocation}
        onSubmit={handleReportSubmit}
      />

      {/* Overlay effects */}
      <div className="fixed inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SafeRouteApp />
    </AuthProvider>
  );
}

