import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ServiceZone } from '../data/logisticsData';

interface CivicStatsBarProps {
  zones: ServiceZone[];
  activeStep: 1 | 2 | 3;
  truckUnitId: string;
}

export const CivicStatsBar: React.FC<CivicStatsBarProps> = ({
  zones,
  activeStep,
  truckUnitId,
}) => {
  const totalTarget = zones.reduce((acc, z) => acc + z.targetMeals, 0);
  const totalServed = zones.reduce((acc, z) => acc + z.mealsServed, 0);
  const urgentCount = zones.filter((z) => z.status === 'high_demand').length;
  const activeCount = zones.filter((z) => z.status === 'active_reserved' || z.status === 'supplied').length;
  const completedCount = zones.filter((z) => z.status === 'disbursed').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Metric 1: Total Meals Delivered */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#64748B]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Meals Disbursed
          </span>
          <TrendingUp className="w-4 h-4 text-[#0D9488]" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold font-mono-metrics text-[#0F172A]">
            {totalServed}
          </span>
          <span className="text-xs text-[#64748B] font-mono-metrics">/ {totalTarget} target</span>
        </div>
        <div className="mt-1 text-[11px] text-[#0D9488] font-medium flex items-center gap-1">
          <span>{Math.round((totalServed / totalTarget) * 100)}% daily quota</span>
        </div>
      </div>

      {/* Metric 2: High Demand Desert Zones */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#64748B]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Urgent Demand Spots
          </span>
          <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold font-mono-metrics text-[#F59E0B]">
            {urgentCount}
          </span>
          <span className="text-xs text-[#64748B]">zones unassigned</span>
        </div>
        <div className="mt-1 text-[11px] text-[#B45309] font-medium">
          Priority relief needed today
        </div>
      </div>

      {/* Metric 3: Active Fleet In Field */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#64748B]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Active Deployments
          </span>
          <Truck className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold font-mono-metrics text-[#0F172A]">
            {activeCount + 1}
          </span>
          <span className="text-xs text-[#64748B]">truck units deployed</span>
        </div>
        <div className="mt-1 text-[11px] text-[#2563EB] font-mono-metrics font-medium">
          Current: {truckUnitId}
        </div>
      </div>

      {/* Metric 4: Zones Completed */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#64748B]">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Zones Fulfilled
          </span>
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold font-mono-metrics text-[#10B981]">
            {completedCount}
          </span>
          <span className="text-xs text-[#64748B]">of {zones.length} sectors</span>
        </div>
        <div className="mt-1 text-[11px] text-[#047857] font-medium">
          Full compliance sign-off
        </div>
      </div>
    </div>
  );
};
