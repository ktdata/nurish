import React, { useState } from 'react';
import {
  Utensils,
  MapPin,
  Clock,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Users,
  HeartHandshake,
  Send,
  Sparkles
} from 'lucide-react';
import { ServiceZone } from '../data/logisticsData';

interface ServeMealsPanelProps {
  zone: ServiceZone;
  truckUnitId: string;
  driverName: string;
  onCompleteService: (finalServed: number, incidentNotes: string) => void;
  onReturnToStep2: () => void;
}

export const ServeMealsPanel: React.FC<ServeMealsPanelProps> = ({
  zone,
  truckUnitId,
  driverName,
  onCompleteService,
  onReturnToStep2,
}) => {
  const [servedCount, setServedCount] = useState(zone.mealsServed || 0);
  const [targetCount] = useState(zone.targetMeals);
  const [waterDisbursed, setWaterDisbursed] = useState(Math.round(servedCount * 1.1));
  const [notes, setNotes] = useState('');
  const [queueStatus, setQueueStatus] = useState<'steady' | 'heavy' | 'winding_down'>('steady');
  const [nutritionCategory, setNutritionCategory] = useState<'regular' | 'vegetarian' | 'low_sodium'>('regular');
  const [justLogged, setJustLogged] = useState<number | null>(null);

  const addMeals = (amount: number) => {
    setServedCount((prev) => {
      const next = Math.max(0, Math.min(targetCount + 100, prev + amount));
      return next;
    });
    setWaterDisbursed((prev) => prev + amount);
    setJustLogged(amount);
    setTimeout(() => setJustLogged(null), 1200);
  };

  const percentComplete = Math.min(100, Math.round((servedCount / targetCount) * 100));

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-metrics font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] px-2 py-0.5 rounded">
              STEP 3: LIVE MEAL DISBURSEMENT
            </span>
            <span className="text-xs text-[#64748B] font-mono-metrics">
              FIELD LOCATION ON-SITE
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight mt-1">
            {zone.name}
          </h2>
          <div className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>{zone.address}</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="font-mono-metrics">{zone.coordinates.gridRef}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-[#64748B] font-mono-metrics block">FIELD LEAD</span>
            <span className="text-xs font-semibold text-[#0F172A]">{zone.contactLead}</span>
          </div>
          <button
            type="button"
            onClick={onReturnToStep2}
            className="text-xs text-[#64748B] hover:text-[#0F172A] p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          >
            Manifest
          </button>
        </div>
      </div>

      {/* Main Real-Time Progress Meter */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Disbursement Target Fulfilled
          </span>
          <span className="text-base font-bold font-mono-metrics text-[#0F172A]">
            {percentComplete}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E2E8F0] h-3.5 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#0D9488] h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Big numbers tally counter */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block font-medium">SERVED TODAY</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-metrics text-[#0D9488] mt-1 block">
              {servedCount}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block font-medium">ZONE TARGET</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-metrics text-[#0F172A] mt-1 block">
              {targetCount}
            </span>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block font-medium">REMAINING</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono-metrics text-[#F59E0B] mt-1 block">
              {Math.max(0, targetCount - servedCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Rapid Field Tally Logging Controls */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#0D9488]" />
            <span>Fast Field Tally Entry</span>
          </h3>
          {justLogged && (
            <span className="text-xs font-mono-metrics font-bold text-[#0D9488] animate-bounce">
              +{justLogged} meals recorded
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => addMeals(1)}
            className="h-14 bg-white hover:bg-[#F0FDFA] border-2 border-[#CBD5E1] hover:border-[#0D9488] text-[#0F172A] hover:text-[#0D9488] rounded-xl font-bold font-mono-metrics text-base flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>1 Meal</span>
          </button>
          <button
            type="button"
            onClick={() => addMeals(5)}
            className="h-14 bg-white hover:bg-[#F0FDFA] border-2 border-[#CBD5E1] hover:border-[#0D9488] text-[#0F172A] hover:text-[#0D9488] rounded-xl font-bold font-mono-metrics text-base flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>5 Family</span>
          </button>
          <button
            type="button"
            onClick={() => addMeals(10)}
            className="h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-bold font-mono-metrics text-base flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>10 Batch</span>
          </button>
          <button
            type="button"
            onClick={() => addMeals(25)}
            className="h-14 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-bold font-mono-metrics text-base flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>25 Crate</span>
          </button>
        </div>
      </div>

      {/* Field Conditions & Crowd Queue Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#F1F5F9]">
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Queue Density & Line Cadence
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setQueueStatus('steady')}
              className={`py-2 text-xs font-medium rounded-md transition-all ${
                queueStatus === 'steady'
                  ? 'bg-white text-[#0D9488] font-bold shadow-xs'
                  : 'text-[#64748B]'
              }`}
            >
              Steady Flow
            </button>
            <button
              type="button"
              onClick={() => setQueueStatus('heavy')}
              className={`py-2 text-xs font-medium rounded-md transition-all ${
                queueStatus === 'heavy'
                  ? 'bg-white text-[#B45309] font-bold shadow-xs'
                  : 'text-[#64748B]'
              }`}
            >
              Heavy Surge
            </button>
            <button
              type="button"
              onClick={() => setQueueStatus('winding_down')}
              className={`py-2 text-xs font-medium rounded-md transition-all ${
                queueStatus === 'winding_down'
                  ? 'bg-white text-[#10B981] font-bold shadow-xs'
                  : 'text-[#64748B]'
              }`}
            >
              Wrapping Up
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Dietary Allocation in Progress
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setNutritionCategory('regular')}
              className={`py-2 text-xs font-medium rounded-md transition-all ${
                nutritionCategory === 'regular'
                  ? 'bg-white text-[#0F172A] font-bold shadow-xs'
                  : 'text-[#64748B]'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setNutritionCategory('vegetarian')}
              className={`py-2 text-xs font-medium rounded-md transition-all ${
                nutritionCategory === 'vegetarian'
                  ? 'bg-white text-[#0D9488] font-bold shadow-xs'
                  : 'text-[#64748B]'
              }`}
            >
              Plant-Based
            </button>
            <button
              type="button"
              onClick={() => setNutritionCategory('low_sodium')}
              className={`py-2 text-xs font-medium rounded-md transition-all ${
                nutritionCategory === 'low_sodium'
                  ? 'bg-white text-[#0D9488] font-bold shadow-xs'
                  : 'text-[#64748B]'
              }`}
            >
              Senior Friendly
            </button>
          </div>
        </div>
      </div>

      {/* Field Incident / Community Notes Field */}
      <div>
        <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
          Field Dispatch Log & Incident Reporting (Optional)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Additional water needed at 13:00; local shelter staff assisted with queue order."
          className="w-full h-12 px-3.5 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-hidden focus:ring-2 focus:ring-[#0D9488] transition-all"
        />
      </div>

      {/* Completion & Sign-off Action Bar */}
      <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#64748B] flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-[#0D9488]" />
          <span>
            Disbursed by <strong className="text-[#0F172A]">{driverName}</strong> · Unit <strong className="font-mono-metrics">{truckUnitId}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => onCompleteService(servedCount, notes)}
          className="w-full sm:w-auto px-6 h-12 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold tracking-tight flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>COMPLETE RELIEF RUN & SUBMIT FIELD REPORT</span>
        </button>
      </div>
    </div>
  );
};
