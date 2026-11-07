import React, { useState } from 'react';
import {
  Truck,
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Camera,
  Navigation,
  Sliders,
  AlertCircle,
  Shield,
  Upload,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeliveryRequest, VolunteerShift, Pantry } from '../types';
import { Badge } from './Badge';

interface VolunteerPortalProps {
  deliveries: DeliveryRequest[];
  onUpdateDeliveryStatus: (id: string, status: DeliveryRequest['status'], proofPhoto?: string) => void;
  shifts: VolunteerShift[];
  onClaimShift: (shiftId: string) => void;
  pantries: Pantry[];
  onUpdatePantryQueue: (pantryId: string, cars: number, waitMinutes: number, trend: 'speeding_up' | 'stable' | 'slowing_down') => void;
  onTogglePantryInventory: (pantryId: string, itemId: string) => void;
  onAssignDelivery: (deliveryId: string, driverName: string) => void;
}

export const VolunteerPortal: React.FC<VolunteerPortalProps> = ({
  deliveries,
  onUpdateDeliveryStatus,
  shifts,
  onClaimShift,
  pantries,
  onUpdatePantryQueue,
  onTogglePantryInventory,
  onAssignDelivery
}) => {
  const [activeTab, setActiveTab] = useState<'routes' | 'shifts' | 'organizer'>('routes');
  const [selectedDeliveryForDrop, setSelectedDeliveryForDrop] = useState<DeliveryRequest | null>(null);
  const [dropPhotoPreview, setDropPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
  );
  const [knockConfirmed, setKnockConfirmed] = useState(true);
  const [maskedCallOpen, setMaskedCallOpen] = useState<string | null>(null);

  // Organizer state
  const [selectedPantryId, setSelectedPantryId] = useState<string>(pantries[0]?.id || '');
  const activePantry = pantries.find((p) => p.id === selectedPantryId) || pantries[0];

  const handleConfirmDrop = () => {
    if (!selectedDeliveryForDrop) return;
    onUpdateDeliveryStatus(selectedDeliveryForDrop.id, 'delivered', dropPhotoPreview);
    setSelectedDeliveryForDrop(null);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#1E5128', '#60A5FA']
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Driver Portal Top Dispatch Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#2563EB]/20 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#111C2D]">
                  Volunteer Steward & Logistics Hub
                </h2>
                <span className="bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#2563EB]/20">
                  Driver Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#414940] mt-0.5">
                Dispatch operations, contactless doorstep grocery drops, and real-time site coordination.
              </p>
            </div>
          </div>

          {/* Quick Shift Summary Pill */}
          <div className="bg-[#F0F3FF] border border-[#2563EB]/20 p-2.5 sm:px-4 sm:py-2 rounded-xl flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1E40AF]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse-dot" />
              <span>Shift: Today 1:30 PM – 4:00 PM</span>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-[#414940]">
              <strong>{deliveries.filter((d) => d.status !== 'delivered').length}</strong> stops remaining
            </span>
          </div>
        </div>

        {/* Tab Navigation (Operational Dispatch Styling) */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#E8EFE9] overflow-x-auto">
          <button
            onClick={() => setActiveTab('routes')}
            className={`min-h-[44px] px-5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'routes'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Active Delivery Route ({deliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shifts')}
            className={`min-h-[44px] px-5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'shifts'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Shift Claim Board</span>
          </button>

          <button
            onClick={() => setActiveTab('organizer')}
            className={`min-h-[44px] px-5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'organizer'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Site Organizer & Queue Desk</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Active Route Deliveries */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#414940] px-1">
            <span>DRIVER ROUTE SEQUENCE: {deliveries.length} RECIPIENT STOPS</span>
            <span className="text-[#2563EB]">All deliveries are 100% contactless</span>
          </div>

          {deliveries.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#CBD5E1]">
              <CheckCircle2 className="w-12 h-12 text-[#15803D] mx-auto mb-2" />
              <h3 className="font-bold text-lg text-[#111C2D]">All assigned deliveries completed!</h3>
              <p className="text-xs text-[#71796F] mt-1">
                Thank you for nourishing our community today. Check the Shift Board for upcoming volunteer routes.
              </p>
            </div>
          ) : (
            deliveries.map((item, idx) => (
              /* Driver Delivery Task Card: Left-bordered with a 6px accent strip in #2563EB */
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-y border-r border-[#CBD5E1] shadow-xs overflow-hidden transition-all border-l-6 ${
                  item.status === 'delivered'
                    ? 'border-l-[#15803D] opacity-75'
                    : 'border-l-[#2563EB] hover:shadow-md'
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top line with stop number and window */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-base text-[#111C2D]">
                        {item.recipientName}
                      </span>
                      <span className="text-xs bg-[#F0F3FF] text-[#1E40AF] font-bold px-2.5 py-0.5 rounded-full capitalize">
                        {item.boxType.replace('_', ' ')} (Family of {item.householdSize})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Window: {item.deliveryWindow}</span>
                      </div>

                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          item.status === 'delivered'
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : item.status === 'in_transit'
                            ? 'bg-[#DBEAFE] text-[#1E40AF]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Address and drop location */}
                  <div className="space-y-1.5 text-sm text-[#414940] mb-3">
                    <div className="flex items-center gap-2 font-medium text-[#111C2D]">
                      <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span>{item.address} ({item.neighborhood})</span>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl text-xs text-[#1E293B]">
                      <strong className="text-[#2563EB]">Safe Drop Instructions:</strong> {item.safeDropNotes}
                    </div>
                  </div>

                  {/* Dietary notes if present */}
                  {item.dietaryRestrictions.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-[#71796F] mb-4">
                      <span className="font-bold text-[#1E293B]">Box specifics:</span>
                      {item.dietaryRestrictions.map((d, i) => (
                        <span key={i} className="bg-[#E8EFE9] text-[#1E5128] px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Operational Driver Action Buttons adhering to Driver Primary button specifications */}
                  <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {/* One-tap Phone-Masking Contact Trigger */}
                      <button
                        onClick={() => setMaskedCallOpen(maskedCallOpen === item.id ? null : item.id)}
                        className="h-10 px-3.5 rounded-full border border-[#CBD5E1] hover:bg-[#F0F3FF] text-[#1E40AF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Masked Contact Call</span>
                      </button>

                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 px-3.5 rounded-full border border-[#CBD5E1] hover:bg-[#F0F3FF] text-[#1E40AF] text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Turn-by-Turn GPS</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'assigned' && (
                        <button
                          onClick={() => onUpdateDeliveryStatus(item.id, 'in_transit')}
                          className="min-h-[44px] sm:min-h-[48px] px-5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Mark Picked Up & En Route</span>
                        </button>
                      )}

                      {item.status === 'in_transit' && (
                        <button
                          onClick={() => setSelectedDeliveryForDrop(item)}
                          className="min-h-[44px] sm:min-h-[48px] px-5 rounded-full bg-[#15803D] hover:bg-[#14532D] active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Confirm Safe Drop & Photo Proof</span>
                        </button>
                      )}

                      {item.status === 'delivered' && (
                        <span className="text-xs font-bold text-[#15803D] flex items-center gap-1.5 bg-[#DCFCE7] px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Safe Drop Complete</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Masked Call simulation drawer */}
                  {maskedCallOpen === item.id && (
                    <div className="mt-3 p-3 bg-[#EFF6FF] border border-[#2563EB]/20 rounded-xl text-xs text-[#1E40AF] animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <Shield className="w-4 h-4" /> Masked Relay Phone Line: (555) 019-8234 (Ext #42)
                        </span>
                        <a
                          href={`tel:${item.phone}`}
                          className="bg-[#2563EB] text-white px-3 py-1 rounded-full font-bold text-xs hover:bg-[#1D4ED8]"
                        >
                          Dial Now
                        </a>
                      </div>
                      <p className="text-[11px] text-[#475569] mt-1">
                        Protects both volunteer and neighbor numbers. Calls bridge automatically through NourishTogether dispatch.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Safe Drop Photo Confirmation Modal */}
      {selectedDeliveryForDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#2563EB]/20 overflow-hidden">
            <div className="bg-[#2563EB] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-white" />
                <h3 className="font-bold text-base">Confirm Safe Doorstep Drop-off</h3>
              </div>
              <button
                onClick={() => setSelectedDeliveryForDrop(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Delivering to: {selectedDeliveryForDrop.recipientName}
                </p>
                <p className="text-sm text-[#111C2D] font-bold mt-0.5">
                  {selectedDeliveryForDrop.address}
                </p>
                <p className="text-xs text-[#414940] mt-1 bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                  <strong>Requested instructions:</strong> {selectedDeliveryForDrop.safeDropNotes}
                </p>
              </div>

              {/* Photo Proof Preview */}
              <div>
                <label className="block text-xs font-bold text-[#111C2D] uppercase tracking-wider mb-2">
                  Drop-off Verification Photo:
                </label>
                <div className="relative h-48 w-full rounded-xl overflow-hidden border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
                  <img
                    src={dropPhotoPreview}
                    alt="Proof preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] p-2 rounded-lg flex items-center justify-between">
                    <span>GPS & Timestamp Tagged: Today</span>
                    <button
                      type="button"
                      onClick={() => {
                        // Alternate mock photo
                        setDropPhotoPreview(
                          dropPhotoPreview.includes('542838132')
                            ? 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
                            : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
                        );
                      }}
                      className="underline text-blue-300 font-semibold cursor-pointer"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Checklist */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2.5 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={knockConfirmed}
                    onChange={(e) => setKnockConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded-md accent-[#2563EB]"
                  />
                  <span>I gave the requested courtesy knock / bell ring to alert neighbor</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-[#1E293B] cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded-md accent-[#2563EB]"
                  />
                  <span>Food box is placed safely in a shaded, protected spot away from sidewalk</span>
                </label>
              </div>

              {/* Driver Primary Operational Button */}
              <div className="pt-3">
                <button
                  onClick={handleConfirmDrop}
                  className="w-full min-h-[52px] bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Safe Drop & Notify Neighbor</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shift Claim Board */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#414940] px-1">
            <span>UPCOMING VOLUNTEER SHIFTS & ROLES</span>
            <span className="text-[#2563EB]">All gear, training & gloves provided</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white rounded-2xl p-5 border border-[#CBD5E1] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge type="shift_open" />
                    {shift.isUrgent && (
                      <span className="text-xs bg-[#FEF3C7] text-[#92400E] font-bold px-2.5 py-0.5 rounded-full">
                        Urgent Need
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-[#111C2D]">{shift.title}</h3>
                  <p className="text-xs font-semibold text-[#2563EB] mt-0.5">{shift.pantryName}</p>

                  <div className="mt-3 space-y-1.5 text-xs text-[#414940]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="font-bold text-[#111C2D]">{shift.date} • {shift.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#71796F]" />
                      <span>{shift.location}</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-3 pt-3 border-t border-[#F1F5F9]">
                    <p className="text-[11px] font-bold text-[#71796F] uppercase tracking-wider mb-1">
                      Requirements:
                    </p>
                    <ul className="text-xs text-[#414940] space-y-0.5 list-disc list-inside">
                      {shift.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Claim Footer */}
                <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                  <div className="text-xs text-[#71796F]">
                    <span className="font-bold text-[#111C2D]">{shift.spotsTotal - shift.spotsClaimed}</span> spots open
                  </div>

                  <button
                    onClick={() => onClaimShift(shift.id)}
                    className={`min-h-[44px] px-5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      shift.claimedByCurrentUser
                        ? 'bg-[#DCFCE7] text-[#166534] border border-[#166534]/30'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
                    }`}
                  >
                    {shift.claimedByCurrentUser ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Claimed by You</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Claim This Shift</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Site Organizer Hub */}
      {activeTab === 'organizer' && (
        <div className="space-y-6">
          {/* Pantry selector */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#CBD5E1] shadow-xs">
            <label className="block text-xs font-bold text-[#71796F] uppercase tracking-wider mb-2">
              Select Distribution Hub to Manage:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {pantries.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPantryId(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activePantry.id === p.id
                      ? 'border-[#2563EB] bg-[#F0F3FF] ring-2 ring-[#2563EB]/20'
                      : 'border-[#CBD5E1] bg-white hover:bg-[#F4F7F4]'
                  }`}
                >
                  <p className="font-bold text-xs text-[#111C2D] truncate">{p.name}</p>
                  <p className="text-[11px] text-[#71796F] mt-0.5">{p.neighborhood}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Queue Adjustment Control */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#CBD5E1] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111C2D]">
                  Live Drive-Thru Queue Dispatcher ({activePantry.name})
                </h3>
                <p className="text-xs text-[#414940]">
                  Changes publish immediately to all community neighbor screens.
                </p>
              </div>
              <span className="text-xs bg-[#E8EFE9] text-[#1E5128] font-bold px-3 py-1 rounded-full">
                Active Hub
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#1E293B]">Current Vehicles in Line:</span>
                  <span className="text-xl font-black text-[#2563EB]">{activePantry.queueCars} cars</span>
                </div>
                <div className="flex gap-2">
                  {[0, 3, 6, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        onUpdatePantryQueue(
                          activePantry.id,
                          num,
                          Math.max(2, Math.round(num * 1.8)),
                          activePantry.queueTrend
                        )
                      }
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                        activePantry.queueCars === num
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white border-[#CBD5E1] text-[#414940] hover:bg-[#F0F3FF]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#1E293B]">Queue Pace / Flow:</span>
                  <span className="text-xs font-bold uppercase text-[#15803D] bg-white px-2 py-0.5 rounded-md border border-[#CBD5E1]">
                    {activePantry.queueTrend.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['speeding_up', 'stable', 'slowing_down'] as const).map((trendOption) => (
                    <button
                      key={trendOption}
                      onClick={() =>
                        onUpdatePantryQueue(
                          activePantry.id,
                          activePantry.queueCars,
                          activePantry.queueWaitMinutes,
                          trendOption
                        )
                      }
                      className={`py-1.5 rounded-lg text-xs font-bold border capitalize cursor-pointer ${
                        activePantry.queueTrend === trendOption
                          ? 'bg-[#1E5128] text-white border-[#1E5128]'
                          : 'bg-white border-[#CBD5E1] text-[#414940]'
                      }`}
                    >
                      {trendOption.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Today's Inventory Stock Toggle */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#CBD5E1] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111C2D]">
                Pantry Supply Inventory Check ({activePantry.name})
              </h3>
              <p className="text-xs text-[#414940]">
                Click items to toggle in-stock / out-of-stock. Keeps neighbors informed before they drive out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePantry.inventory.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onTogglePantryInventory(activePantry.id, inv.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    inv.inStock
                      ? 'bg-white border-[#15803D]/30 hover:border-[#15803D]'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] opacity-60'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold ${inv.inStock ? 'text-[#111C2D]' : 'text-slate-400 line-through'}`}>
                      {inv.name}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-[#71796F]">{inv.category}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      inv.inStock
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                  >
                    {inv.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
