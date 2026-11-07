import React, { useState } from 'react';
import {
  PackageCheck,
  Building2,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  Truck,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { ServiceZone } from '../data/logisticsData';

interface SupplyPickupPanelProps {
  zone: ServiceZone;
  truckUnitId: string;
  driverName: string;
  onConfirmSuppliesLoaded: (verifiedItemsCount: number) => void;
  onReturnToStep1: () => void;
}

export const SupplyPickupPanel: React.FC<SupplyPickupPanelProps> = ({
  zone,
  truckUnitId,
  driverName,
  onConfirmSuppliesLoaded,
  onReturnToStep1,
}) => {
  const [items, setItems] = useState(zone.pickupDepot.itemsReady);
  const [operatorId, setOperatorId] = useState('DEPOT-CLERK-884');
  const [dockBayNumber, setDockBayNumber] = useState('BAY-04');
  const [tempChecked, setTempChecked] = useState(true);
  const [sealIntact, setSealIntact] = useState(true);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const allVerified = items.every((i) => i.checked) && tempChecked && sealIntact;
  const verifiedCount = items.filter((i) => i.checked).length;

  const handleSelectAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: true })));
    setTempChecked(true);
    setSealIntact(true);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-metrics font-bold bg-[#E6FFFA] text-[#0D9488] border border-[#99F6E4] px-2 py-0.5 rounded">
              STEP 2: PICK UP SUPPLIES
            </span>
            <span className="text-xs text-[#64748B] font-mono-metrics">
              DEPOT DISPATCH GATE
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight mt-1">
            {zone.pickupDepot.name}
          </h2>
          <div className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
            <Building2 className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>{zone.pickupDepot.address}</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="font-mono-metrics">{zone.pickupDepot.code}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] text-[#64748B] font-mono-metrics">TRANSFER BAY</div>
            <div className="text-sm font-bold font-mono-metrics text-[#0F172A]">{dockBayNumber}</div>
          </div>
          <button
            type="button"
            onClick={onReturnToStep1}
            className="text-xs text-[#64748B] hover:text-[#0F172A] p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
            title="Change spot reservation"
          >
            Change Spot
          </button>
        </div>
      </div>

      {/* Target Destination Confirmation Summary */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-[#86f2e4]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0F172A]">
              Assigned Vehicle: <span className="font-mono-metrics text-[#0D9488]">{truckUnitId}</span> (Driver: {driverName})
            </div>
            <div className="text-xs text-[#64748B] mt-0.5">
              Destination: <strong className="text-[#0F172A]">{zone.name}</strong> · Target: <span className="font-mono-metrics font-bold">{zone.targetMeals}</span> meals
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-metrics text-[#64748B]">
          <Clock className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>PICKUP WINDOW: {zone.pickupDepot.window}</span>
        </div>
      </div>

      {/* Manifest Inventory Checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#0D9488]" />
              <span>Depot Supply Transfer Manifest</span>
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Verify each crate and food item physically before latching truck cargo doors.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-[#0D9488] hover:text-[#0F766E] font-medium underline cursor-pointer"
          >
            Check All Items
          </button>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => (
            <label
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                item.checked
                  ? 'border-[#0D9488] bg-[#F0FDFA]'
                  : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Tactile Checkbox: 22x22px conforming to design spec */}
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="sr-only"
                />
                <div
                  className={`w-[22px] h-[22px] rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                    item.checked
                      ? 'bg-[#0D9488] border-[#0D9488] text-white'
                      : 'border-[#CBD5E1] bg-white'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div>
                  <div
                    className={`text-sm font-medium ${
                      item.checked ? 'text-[#0F172A]' : 'text-[#334155]'
                    }`}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs text-[#64748B] font-mono-metrics">
                    LOT #{item.id.toUpperCase()}-2026-VAL · INSPECTED
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-bold font-mono-metrics text-[#0F172A]">
                  {item.quantity}
                </span>
                <span className="text-xs text-[#64748B] ml-1">{item.unit}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Food Safety & Chain-of-Custody Protocols */}
      <div className="pt-2 border-t border-[#F1F5F9] grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-center gap-3 p-3 rounded-lg border border-[#CBD5E1] bg-white cursor-pointer hover:border-[#94A3B8]">
          <input
            type="checkbox"
            checked={tempChecked}
            onChange={(e) => setTempChecked(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-[22px] h-[22px] rounded-[4px] border flex items-center justify-center shrink-0 ${
              tempChecked
                ? 'bg-[#0D9488] border-[#0D9488] text-white'
                : 'border-[#CBD5E1] bg-white'
            }`}
          >
            {tempChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0F172A]">Thermal Hot-Hold Verification</div>
            <div className="text-[11px] text-[#64748B]">Core temperature verified &gt; 145°F / Cambro seal active</div>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-lg border border-[#CBD5E1] bg-white cursor-pointer hover:border-[#94A3B8]">
          <input
            type="checkbox"
            checked={sealIntact}
            onChange={(e) => setSealIntact(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-[22px] h-[22px] rounded-[4px] border flex items-center justify-center shrink-0 ${
              sealIntact
                ? 'bg-[#0D9488] border-[#0D9488] text-white'
                : 'border-[#CBD5E1] bg-white'
            }`}
          >
            {sealIntact && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#0F172A]">Cargo Safety Seal Intact</div>
            <div className="text-[11px] text-[#64748B]">Tamper-evident latch locked · Hygiene protocol signed</div>
          </div>
        </label>
      </div>

      {/* Depot Officer Sign-Off & Action Trigger */}
      <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          <span>
            Verified by: <strong className="text-[#0F172A] font-mono-metrics">{operatorId}</strong> (Depot Supervisor)
          </span>
        </div>

        <button
          type="button"
          disabled={!allVerified}
          onClick={() => onConfirmSuppliesLoaded(verifiedCount)}
          className={`w-full sm:w-auto px-6 h-12 rounded-lg text-xs font-bold tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer ${
            allVerified
              ? 'bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-md'
              : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
          }`}
        >
          <span>CONFIRM LOAD & DISPATCH TO SERVICE ZONE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
