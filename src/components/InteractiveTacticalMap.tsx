import React from 'react';
import { MapPin, Navigation, Compass, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ServiceZone } from '../data/logisticsData';

interface InteractiveTacticalMapProps {
  zones: ServiceZone[];
  selectedZone: ServiceZone | null;
  onSelectZone: (zone: ServiceZone) => void;
  truckUnitId: string;
}

export const InteractiveTacticalMap: React.FC<InteractiveTacticalMapProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  truckUnitId,
}) => {
  // SVG tactical coordinates mapped from Bay Area bounding box:
  // lat roughly 37.72 to 37.80, lng -122.44 to -122.37
  const minLat = 37.72;
  const maxLat = 37.80;
  const minLng = -122.445;
  const maxLng = -122.375;

  const projectToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 700 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 50;
    return { x, y };
  };

  const truckPos = selectedZone
    ? projectToSvg(selectedZone.coordinates.lat - 0.006, selectedZone.coordinates.lng - 0.008)
    : { x: 380, y: 320 };

  return (
    <div className="relative w-full h-[380px] lg:h-[460px] bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] overflow-hidden select-none">
      {/* SVG Map Canvas */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Tactical grid pattern */}
          <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.75" strokeOpacity="0.5" />
          </pattern>
          <linearGradient id="bay-water" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Base Grid Layer */}
        <rect width="800" height="600" fill="#F8FAFC" />
        <rect width="800" height="600" fill="url(#tactical-grid)" />

        {/* Simplified SF Bay Shoreline contour */}
        <path
          d="M 620,0 Q 640,140 680,240 T 730,420 Q 750,520 800,600 L 800,0 Z"
          fill="url(#bay-water)"
        />

        {/* Tactical Arterial Road Network */}
        <g stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Highway 101 corridor */}
          <path d="M 220,590 C 260,450 340,320 440,220 S 490,90 510,0" strokeWidth="3.5" stroke="#94A3B8" />
          {/* I-80 / Bay Bridge feeder */}
          <path d="M 440,220 Q 560,190 750,150" strokeWidth="3" stroke="#94A3B8" strokeDasharray="6 4" />
          {/* Market St arterial */}
          <path d="M 160,380 L 520,160" strokeWidth="3" stroke="#CBD5E1" />
          {/* Mission / Van Ness cross grid */}
          <path d="M 280,590 L 330,120 L 340,0" strokeWidth="2" stroke="#E2E8F0" />
          <path d="M 410,590 L 450,250 L 460,0" strokeWidth="2" stroke="#E2E8F0" />
          <path d="M 120,240 L 600,240" strokeWidth="1.5" stroke="#E2E8F0" />
          <path d="M 150,340 L 620,340" strokeWidth="1.5" stroke="#E2E8F0" />
          <path d="M 200,440 L 650,440" strokeWidth="1.5" stroke="#E2E8F0" />
        </g>

        {/* Active Route Waypoint Line if a zone is selected */}
        {selectedZone && (
          <g>
            {/* Depot reference point */}
            <circle cx="530" cy="380" r="6" fill="#0F172A" />
            <text x="542" y="384" fill="#0F172A" fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">
              DEPOT ALPHA
            </text>

            {/* Line from Truck -> Selected Zone */}
            {(() => {
              const target = projectToSvg(selectedZone.coordinates.lat, selectedZone.coordinates.lng);
              return (
                <>
                  <path
                    d={`M ${truckPos.x},${truckPos.y} Q ${(truckPos.x + target.x) / 2 + 25},${(truckPos.y + target.y) / 2 - 20} ${target.x},${target.y}`}
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  {/* Waypoint distance callout */}
                  <rect
                    x={(truckPos.x + target.x) / 2 - 25}
                    y={(truckPos.y + target.y) / 2 - 32}
                    width="58"
                    height="18"
                    rx="4"
                    fill="#0F172A"
                  />
                  <text
                    x={(truckPos.x + target.x) / 2 + 4}
                    y={(truckPos.y + target.y) / 2 - 20}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    1.4 MI · 6M
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Current Mobile Food Truck Unit Position */}
        <g transform={`translate(${truckPos.x}, ${truckPos.y})`}>
          <circle r="16" fill="#2563EB" fillOpacity="0.18" className="animate-ping" />
          <circle r="11" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M -3 -4 L 4 0 L -3 4 Z" fill="#FFFFFF" />
          <rect x="14" y="-10" width="94" height="20" rx="4" fill="#0F172A" fillOpacity="0.95" />
          <text x="61" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="JetBrains Mono" fontWeight="600">
            {truckUnitId} (GPS)
          </text>
        </g>

        {/* Service Zone Waypoints */}
        {zones.map((zone) => {
          const { x, y } = projectToSvg(zone.coordinates.lat, zone.coordinates.lng);
          const isSelected = selectedZone?.id === zone.id;
          const isUrgent = zone.status === 'high_demand';
          const isSupplied = zone.status === 'supplied' || zone.status === 'disbursed';

          const pinColor = isUrgent ? '#F59E0B' : isSupplied ? '#10B981' : '#0D9488';

          return (
            <g
              key={zone.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onSelectZone(zone)}
            >
              {isSelected && (
                <circle r="22" fill={pinColor} fillOpacity="0.22" className="animate-pulse" />
              )}
              {/* Outer halo */}
              <circle
                r={isSelected ? 14 : 11}
                fill={pinColor}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                filter="drop-shadow(0px 2px 4px rgba(15,23,42,0.2))"
              />
              {/* Inner symbol */}
              <circle r={isSelected ? 5 : 4} fill="#FFFFFF" />

              {/* Waypoint Label Badge */}
              <g transform="translate(16, -12)">
                <rect
                  width="86"
                  height="22"
                  rx="4"
                  fill="#FFFFFF"
                  stroke={isSelected ? pinColor : '#E2E8F0'}
                  strokeWidth={isSelected ? '2' : '1'}
                />
                <text
                  x="6"
                  y="14"
                  fill="#0F172A"
                  fontSize="9.5"
                  fontFamily="Plus Jakarta Sans"
                  fontWeight="700"
                >
                  {zone.code}
                </text>
                <text
                  x="56"
                  y="14"
                  fill={pinColor}
                  fontSize="8.5"
                  fontFamily="JetBrains Mono"
                  fontWeight="700"
                >
                  {zone.targetMeals}m
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Floating Tactical Map Overlay Controls */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs border border-[#E2E8F0] px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-mono-metrics font-semibold text-[#0F172A]">
            SECTOR SF-CENTRAL
          </span>
          <span className="text-[11px] text-[#64748B] font-mono-metrics">37.7749° N</span>
        </div>
        <div className="pointer-events-auto bg-white/95 backdrop-blur-xs border border-[#E2E8F0] px-2.5 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 text-xs text-[#0F172A] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span>High Demand</span>
          <span className="mx-1 text-[#CBD5E1]">|</span>
          <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
          <span>Reserved</span>
          <span className="mx-1 text-[#CBD5E1]">|</span>
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Supplied</span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-auto">
        <div className="bg-[#0F172A]/90 text-white text-[11px] font-mono-metrics px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
          <Compass className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>GPS FIX: ACCURATE TO ±2.4M</span>
        </div>
      </div>
    </div>
  );
};
