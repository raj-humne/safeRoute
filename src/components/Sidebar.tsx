import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Map as MapIcon, 
  AlertCircle, 
  User, 
  Search, 
  Navigation,
  Activity,
  LogOut,
  Bell,
  Menu,
  Settings,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

interface SidebarProps {
  onSearch: (start: string, destination: string) => void;
  activeRoute: any;
  loading: boolean;
  reports: any[];
  isNavigating: boolean;
  onRecenter: () => void;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onSOS: () => void;
  sosStatus: 'idle' | 'triggered';
}

export default function Sidebar({ 
  onSearch, 
  activeRoute, 
  loading, 
  reports, 
  isNavigating,
  onRecenter,
  onStartNavigation,
  onStopNavigation,
  onSOS,
  sosStatus
}: SidebarProps) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [startQuery, setStartQuery] = useState("My Location");
  const [destQuery, setDestQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<'route' | 'stats'>('route');

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full z-40 transition-all duration-300 pointer-events-none p-4",
      isCollapsed ? "w-24 px-2" : "w-full md:w-[400px]"
    )}>
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "h-full glass-card pointer-events-auto flex flex-col overflow-hidden relative transition-all duration-300",
          isCollapsed ? "w-16 items-center" : "w-full"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-4 border-b border-white/10 flex items-center justify-between transition-all",
          isCollapsed ? "flex-col gap-4 py-8" : "p-6"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20">
                <Shield size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter">
                Safe<span className="text-neon-blue">Route</span>
              </h1>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg shadow-neon-blue/20 mb-4">
              <Shield size={20} className="text-white" />
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10",
              isCollapsed && "mt-2"
            )}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          isCollapsed ? "p-0 py-4 flex flex-col items-center" : "p-4 space-y-6"
        )}>
          {!isCollapsed ? (
            <>
              {/* Profile Card */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center space-y-3">
                  <p className="text-sm text-gray-400">Sign in to report areas and save routes</p>
                  <button 
                    onClick={loginWithGoogle}
                    className="w-full py-2 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <User size={18} />
                    Google Login
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <img src={user.photoURL || ""} alt="Avatar" className="w-10 h-10 rounded-full border border-neon-blue/50" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button onClick={logout} className="p-2 hover:text-red-400 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveTab('route')}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl transition-all",
                    activeTab === 'route' ? "bg-white/10 border border-white/20 text-neon-blue" : "bg-white/5 border border-transparent opacity-60"
                  )}
                >
                  <Navigation size={18} />
                  <span className="text-sm font-semibold">Route</span>
                </button>
                <button 
                  onClick={() => setActiveTab('stats')}
                  className={cn(
                    "flex items-center justify-center gap-2 p-3 rounded-xl transition-all",
                    activeTab === 'stats' ? "bg-white/10 border border-white/20 text-neon-blue" : "bg-white/5 border border-transparent opacity-60"
                  )}
                >
                  <Activity size={18} />
                  <span className="text-sm font-semibold">Stats</span>
                </button>
              </div>

              {activeTab === 'route' ? (
                <>
                  {/* Routing Inputs */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10 my-6 ml-[-1px] rounded-full" />
                  
                  <div className="relative mb-3">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-blue" size={16} />
                    <input 
                      type="text" 
                      placeholder="Start point..."
                      value={startQuery}
                      onChange={(e) => setStartQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue/50 transition-colors text-sm"
                    />
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Enter destination..."
                      value={destQuery}
                      onChange={(e) => setDestQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onSearch(startQuery, destQuery)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-neon-blue/50 transition-colors text-sm"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => onSearch(startQuery, destQuery)}
                  disabled={loading || !destQuery}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Navigation size={18} />}
                  Find Safest Path
                </button>
              </div>

              {/* Safety Quick Stats */}
              {!activeRoute && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Reports</p>
                    <p className="text-2xl font-bold text-neon-blue">{reports.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Global Safety</p>
                    <p className="text-2xl font-bold text-green-400">Stable</p>
                  </div>
                </div>
              )}

              {/* Route Info */}
              <AnimatePresence>
                {activeRoute && !isNavigating && (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 space-y-5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-1 font-bold">Safest Path Found</p>
                        <h3 className="text-2xl font-bold tracking-tight">{activeRoute.properties.distance}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="px-2 py-1 rounded-md bg-neon-blue/20 text-neon-blue text-[10px] font-bold border border-neon-blue/30 uppercase tracking-wider">
                          {activeRoute.properties.safetyScore} Safety Score
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">Calculated now</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-2">
                      <div className="space-y-1">
                         <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Est. Time</span>
                         <p className="text-lg font-mono text-white flex items-center gap-2">
                           <Activity size={14} className="text-neon-blue" />
                           {activeRoute.properties.estimatedTime}
                         </p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Risk Avoided</span>
                         <p className={cn(
                           "text-lg font-bold flex items-center gap-2",
                           activeRoute.properties.dangerZonesAvoided > 0 ? "text-green-400" : "text-gray-400"
                         )}>
                           <Shield size={14} />
                           {activeRoute.properties.dangerZonesAvoided} Reports
                         </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={onStartNavigation}
                        className="w-full py-3.5 bg-neon-blue text-black font-bold rounded-xl shadow-lg shadow-neon-blue/30 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                      >
                        <Navigation size={18} />
                        Start Active Navigation
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Mode */}
              <AnimatePresence>
                {isNavigating && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Navigation size={20} className="text-black" />
                      </div>
                      <div>
                        <h3 className="font-bold text-green-400">Navigating...</h3>
                        <p className="text-xs text-gray-400">Follow the cyan path</p>
                      </div>
                    </div>
                    <button 
                      onClick={onStopNavigation}
                      className="w-full py-2 border border-red-500/30 text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      Stop Navigation
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Stats View */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Safety Index Trend</h3>
                    <div className="h-24 flex items-end gap-1 px-2">
                      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-neon-blue/20 border-t border-neon-blue/50 rounded-t-sm"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 px-1 font-mono">
                      <span>MON</span><span>WED</span><span>FRI</span><span>SUN</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Community Metrics</h3>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-xs text-gray-400">Total Safety Reports</span>
                          <span className="font-bold text-neon-blue">{reports.length}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-xs text-gray-400">Verified Safe Zones</span>
                          <span className="font-bold text-green-400">{reports.filter(r => r.type === 'safety').length}</span>
                       </div>
                       <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-xs text-gray-400">Escalated Danger Alerts</span>
                          <span className="font-bold text-red-400">{reports.filter(r => r.type === 'danger').length}</span>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3">
                <button 
                  onClick={onSOS}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95",
                    sosStatus === 'triggered' 
                      ? "bg-red-600 text-white animate-pulse shadow-red-500/50" 
                      : "bg-white/5 border border-red-500/30 text-red-500 hover:bg-red-500/10"
                  )}
                >
                  <AlertTriangle size={18} />
                  {sosStatus === 'triggered' ? "SOS ACTIVE - HELP ON WAY" : "Trigger Emergency SOS"}
                </button>

                <div className="space-y-2">
                  <button 
                    onClick={() => alert("Checking for local safety alerts...")}
                    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-sm border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-gray-400" />
                      <span>Recent Safety Alerts</span>
                    </div>
                    <span className="bg-red-500/20 text-red-500 text-[10px] px-1.5 py-0.5 rounded font-bold">2 NEW</span>
                  </button>
                  <button 
                    onClick={() => alert("Settings panel mock-up")}
                    className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors text-sm"
                  >
                    <Settings size={18} className="text-gray-400" />
                    <span>Navigation Settings</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 pt-4">
              <button onClick={onRecenter} className="p-2 hover:bg-white/10 rounded-xl text-neon-blue transition-colors group relative">
                <MapPin size={24} />
                <span className="absolute left-14 bg-cyber-dark px-2 py-1 rounded text-[10px] hidden group-hover:block whitespace-nowrap">Recenter</span>
              </button>
              <button onClick={() => { setActiveTab('route'); setIsCollapsed(false); }} className="hover:text-neon-blue transition-colors">
                 <Navigation size={24} className={activeTab === 'route' ? "text-neon-blue" : "text-gray-500"} />
              </button>
              <button onClick={() => { setActiveTab('stats'); setIsCollapsed(false); }} className="hover:text-neon-blue transition-colors">
                 <Activity size={24} className={activeTab === 'stats' ? "text-neon-blue" : "text-gray-500"} />
              </button>
              <button onClick={() => alert("Recent alerts...")} className="text-gray-500 hover:text-white transition-colors">
                <Bell size={24} />
              </button>
              <button onClick={() => user ? logout() : loginWithGoogle()} className="text-gray-500 hover:text-white transition-colors">
                <User size={24} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
