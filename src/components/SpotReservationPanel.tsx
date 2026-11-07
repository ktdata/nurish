import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Utensils,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ServiceZone } from '../data/logisticsData';

interface SpotReservationPanelProps {
  zones: ServiceZone[];
  selectedZone: ServiceZone | null;
  onSelectZone: (zone: ServiceZone) => void;
  onCommitReservation: (zoneId: string) => void;
  isReserved: boolean;
  activeReservedZoneId: string | null;
}

export const SpotReservationPanel: React.FC<SpotReservationPanelProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  onCommitReservation,
  isReserved,
  activeReservedZoneId,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'high_demand' | 'active_reserved' | 'completed'>('all');

  const filteredZones = zones.filter((zone) => {
    if (filterType === 'high_demand') return zone.status === 'high_demand';
    if (filterType === 'active_reserved') return zone.status === 'active_reserved' || zone.status === 'supplied';
    if (filterType === 'completed') return zone.status === 'disbursed';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Interactive Segmented Filter Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All Relief Zones ({zones.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('high_demand')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'high_demand'
                ? 'bg-white text-[#B45309] shadow-xs'
                : 'text-[#64748B] hover:text-[#B45309]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            High Demand
          </button>
          <button
            type="button"
            onClick={() => setFilterType('active_reserved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterType === 'active_reserved'
                ? 'bg-white text-[#0D9488] shadow-xs'
                : 'text-[#64748B] hover:text-[#0D9488]'
            }`}
          >
            En Route / Active
          </button>
          <button
            type="button"
            onClick={() => setFilterType('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterType === 'completed'
                ? 'bg-white text-[#10B981] shadow-xs'
                : 'text-[#64748B] hover:text-[#10B981]'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="text-xs text-[#64748B] font-mono-metrics">
          LIVE FEED · 5 ACTIVE SECTORS
        </div>
      </div>

      {/* Grid of Dispatch Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredZones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          const isThisZoneReservedByUs = activeReservedZoneId === zone.id;
          const isHighDemand = zone.status === 'high_demand';
          const isCompleted = zone.status === 'disbursed';

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              className={`bg-white border rounded-xl p-4 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-md'
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs'
              }`}
            >
              <div>
                {/* Header Area with priority index and status pill */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-metrics font-bold tracking-tight text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded">
                      {zone.priorityIndex}
                    </span>
                    <span className="text-xs font-mono-metrics text-[#64748B]">
                      {zone.code}
                    </span>
                  </div>

                  {/* Status Badges conforming to design system */}
                  {isHighDemand ? (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      High Demand Spot
                    </span>
                  ) : isCompleted ? (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      Disbursed & Closed
                    </span>
                  ) : (
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                      {isThisZoneReservedByUs ? 'Your Committed Spot' : 'Active Relief Unit'}
                    </span>
                  )}
                </div>

                {/* Card Title */}
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight leading-snug">
                  {zone.name}
                </h3>

                <div className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span className="truncate">{zone.address}</span>
                  <span className="text-[#CBD5E1]">·</span>
                  <span className="shrink-0">{zone.neighborhood}</span>
                </div>

                {/* Coordinates & Technical Metrics */}
                <div className="mt-2.5 pt-2.5 border-t border-[#F1F5F9] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-[#64748B] block">COORDINATES</span>
                    <span className="font-mono-metrics font-medium text-[#0F172A] text-[11px]">
                      {zone.coordinates.gridRef}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#64748B] block">MEAL FORMULA</span>
                    <span className="font-medium text-[#0F172A] truncate block text-[11px]">
                      {zone.mealType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer with Split Inline Metrics & Action */}
              <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]/70">
                  <div>
                    <span className="text-[10px] text-[#64748B] font-medium block">TARGET</span>
                    <span className="text-sm font-bold font-mono-metrics text-[#0F172A]">
                      {zone.targetMeals}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-medium block">SERVED</span>
                    <span className="text-sm font-bold font-mono-metrics text-[#0D9488]">
                      {zone.mealsServed}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] font-medium block">WINDOW</span>
                    <span className="text-xs font-semibold font-mono-metrics text-[#0F172A] block mt-0.5 truncate">
                      {zone.timeWindow}
                    </span>
                  </div>
                </div>

                {/* Full-width commit trigger */}
                {isThisZoneReservedByUs ? (
                  <div className="w-full h-11 rounded-lg bg-[#ECFDF5] border border-[#10B981] text-[#047857] text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span>SPOT RESERVED BY THIS UNIT</span>
                  </div>
                ) : isCompleted ? (
                  <button
                    type="button"
                    disabled
                    className="w-full h-11 rounded-lg bg-[#F1F5F9] text-[#94A3B8] text-xs font-semibold flex items-center justify-center cursor-not-allowed"
                  >
                    SERVICE COMPLETED & VERIFIED
                  </button>
                ) : isHighDemand ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCommitReservation(zone.id);
                    }}
                    className="w-full h-11 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] text-xs font-bold tracking-tight flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                    <span>CLAIM CRITICAL SPOT & DISPATCH TRUCK</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCommitReservation(zone.id);
                    }}
                    className="w-full h-11 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold tracking-tight flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>RESERVE SPOT & ROUTE TO DEPOT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
