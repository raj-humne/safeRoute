import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap, 
  Polyline,
  useMapEvents 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { AlertTriangle, ShieldCheck, MapPin, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface MapViewProps {
  center: [number, number];
  userLocation: [number, number] | null;
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  reports?: any[];
  activeRoute?: any;
}

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
};

// Custom Marker Icons
const createMarkerIcon = (report: any) => {
  const isDanger = report.type === 'danger';
  const color = isDanger ? '#ef4444' : '#22c55e';
  const glowClass = isDanger ? 'animate-pulse' : '';
  
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="${glowClass}" style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.8); box-shadow: 0 0 15px ${color}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapEvents = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export default function MapComponent({ center, userLocation, zoom, onMapClick, reports = [], activeRoute }: MapViewProps) {
  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <RecenterMap center={center} />
        {onMapClick && <MapEvents onClick={onMapClick} />}

        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={new L.DivIcon({
              className: 'user-location-icon',
              html: `<div class="relative flex items-center justify-center">
                <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
                <div class="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          >
            <Popup className="custom-popup">
              <div className="text-xs font-bold text-blue-400">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={createMarkerIcon(report)}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-[200px] bg-cyber-dark text-white rounded-lg border border-white/10 glass-card">
                <div className="flex items-center gap-2 font-bold mb-2 pb-2 border-b border-white/10">
                  {report.type === 'danger' ? (
                    <AlertTriangle size={18} className="text-red-500 fill-red-500/20" />
                  ) : (
                    <ShieldCheck size={18} className="text-green-500 fill-green-500/20" />
                  )}
                  <span className={cn(
                    "text-sm uppercase tracking-wider",
                    report.type === 'danger' ? 'text-red-500' : 'text-green-500'
                  )}>
                    {report.category}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {report.description || "No additional description provided."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Info size={12} />
                      <span>Reliability: {report.severity}/5</span>
                    </div>
                    <span className="text-[10px] text-gray-500 italic">
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {activeRoute && (
          <>
            {/* Background Glow */}
            <Polyline 
              positions={activeRoute.geometry.coordinates.map((c: any) => [c[1], c[0]])}
              pathOptions={{ 
                color: '#00f2ff', 
                weight: 12, 
                opacity: 0.15,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main Detailed Path */}
            <Polyline 
              positions={activeRoute.geometry.coordinates.map((c: any) => [c[1], c[0]])}
              pathOptions={{ 
                color: '#00f2ff', 
                weight: 4, 
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: '1, 10',
                dashOffset: '0'
              }}
            />
            {/* Start & End Markers */}
            <Marker position={[activeRoute.geometry.coordinates[0][1], activeRoute.geometry.coordinates[0][0]]} icon={createMarkerIcon({ type: 'safety', category: 'START' })} />
            <Marker position={[activeRoute.geometry.coordinates[activeRoute.geometry.coordinates.length-1][1], activeRoute.geometry.coordinates[activeRoute.geometry.coordinates.length-1][0]]} icon={createMarkerIcon({ type: 'danger', category: 'DESTINATION' })} />
          </>
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-10 glass-card p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-red-500 neon-glow" />
          <span>Danger Zone</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-green-500" style={{ boxShadow: '0 0 10px #22c55e' }} />
          <span>Verified Safe</span>
        </div>
      </div>
    </div>
  );
}
