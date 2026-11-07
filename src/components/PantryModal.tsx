import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Car,
  Package,
  CheckCircle2,
  Share2,
  Calendar,
  Languages,
  Truck,
  Heart
} from 'lucide-react';
import { Pantry } from '../types';
import { Badge } from './Badge';
import { MicroCopyBanner } from './MicroCopyBanner';
import { QueueReporterModal } from './QueueReporterModal';

interface PantryModalProps {
  pantry: Pantry;
  onClose: () => void;
  onNavigate: (pantry: Pantry) => void;
  onRequestDelivery: (pantry: Pantry) => void;
  onUpdateQueue: (pantryId: string, cars: number, waitMinutes: number, trend: 'speeding_up' | 'stable' | 'slowing_down') => void;
}

export const PantryModal: React.FC<PantryModalProps> = ({
  pantry,
  onClose,
  onNavigate,
  onRequestDelivery,
  onUpdateQueue
}) => {
  const [showQueueReporter, setShowQueueReporter] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pantry.name,
        text: `Free community food distribution at ${pantry.name} - No ID required.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${pantry.name} - ${pantry.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-[#1E293B]/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#1E5128]/15 overflow-hidden my-auto max-h-[92vh] flex flex-col">
          {/* Header image & close button */}
          <div className="relative h-56 sm:h-64 w-full bg-[#E8EFE9] shrink-0">
            <img
              src={pantry.imageUrl}
              alt={pantry.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

            {/* Top action icons */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                  pantry.openToday ? 'bg-[#15803D] text-white' : 'bg-[#64748B] text-white'
                }`}
              >
                {pantry.openToday ? 'Open Today' : 'Closed Today'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Share pantry info"
                  className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9CD49E]">
                {pantry.organization}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow-xs">
                {pantry.name}
              </h2>
              <div className="flex items-center gap-3 text-xs mt-1 text-white/90">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9CD49E]" />
                  {pantry.distanceMiles} miles away
                </span>
                <span>•</span>
                <span>{pantry.neighborhood}</span>
              </div>
            </div>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {copied && (
              <div className="bg-[#DCFCE7] text-[#15803D] text-xs font-bold px-3 py-2 rounded-xl text-center">
                Pantry address copied to clipboard!
              </div>
            )}

            {/* Dignified Badges */}
            <div className="flex flex-wrap gap-2">
              {pantry.badges.map((b) => (
                <Badge key={b} type={b} />
              ))}
            </div>

            {/* Reassuring Harvest Micro-copy Banner */}
            <MicroCopyBanner
              icon="heart"
              text="No identification, proof of income, or papers required."
              subtext="Food is a universal human right. Our volunteers warmly greet every community member with unconditional dignity and confidentiality."
            />

            {/* Live Queue Section */}
            {pantry.driveThruLaneActive && (
              <div className="bg-[#F4F7F4] border-2 border-[#1E5128]/20 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2 text-[#1E5128] font-bold text-sm">
                    <Car className="w-5 h-5" />
                    <span>Real-Time Drive-Thru Queue</span>
                  </div>
                  <span className="text-xs bg-white px-2.5 py-1 rounded-full text-[#414940] border border-[#CBD5E1]">
                    Updated {pantry.lastQueueUpdate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white p-3 rounded-xl border border-[#CBD5E1]">
                    <p className="text-xs text-[#71796F] font-semibold">VEHICLES IN QUEUE</p>
                    <p className="text-2xl font-black text-[#111C2D]">{pantry.queueCars} cars</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#CBD5E1]">
                    <p className="text-xs text-[#71796F] font-semibold">ESTIMATED WAIT</p>
                    <p className="text-2xl font-black text-[#15803D]">~{pantry.queueWaitMinutes} mins</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#414940] mb-3">
                  <span>Drive-thru speed: <strong className="text-[#1E5128] capitalize">{pantry.queueTrend.replace('_', ' ')}</strong></span>
                  <span>Contactless trunk drop</span>
                </div>

                <button
                  onClick={() => setShowQueueReporter(true)}
                  className="w-full py-2.5 px-4 rounded-full border border-[#1E5128] text-[#1E5128] font-bold text-xs hover:bg-[#E8EFE9] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Car className="w-4 h-4" />
                  <span>Update Wait Time from My Car</span>
                </button>
              </div>
            )}

            {/* Operating Hours & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#F4F7F4] p-4 rounded-xl border border-[#CBD5E1]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#71796F] uppercase tracking-wider mb-1">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span>Schedule & Hours</span>
                </div>
                <p className="text-sm font-bold text-[#111C2D]">{pantry.hoursToday}</p>
                <p className="text-xs text-[#414940] mt-1">{pantry.scheduleDescription}</p>
              </div>

              <div className="bg-[#F4F7F4] p-4 rounded-xl border border-[#CBD5E1]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#71796F] uppercase tracking-wider mb-1">
                  <MapPin className="w-4 h-4 text-[#1E5128]" />
                  <span>Address & Parking</span>
                </div>
                <p className="text-sm font-bold text-[#111C2D]">{pantry.address}</p>
                <p className="text-xs text-[#414940] mt-1">{pantry.notes}</p>
              </div>
            </div>

            {/* Languages & Accessibility */}
            <div className="flex items-center gap-2 text-xs text-[#414940] bg-[#E8EFE9]/60 p-3 rounded-xl">
              <Languages className="w-4 h-4 text-[#1E5128] shrink-0" />
              <span>
                <strong>Languages supported by on-site volunteers:</strong> {pantry.languagesSpoken.join(', ')}
              </span>
            </div>

            {/* Today's Available Food Inventory */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-[#111C2D] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#1E5128]" />
                  <span>Available Food & Supplies Today</span>
                </h4>
                <span className="text-xs text-[#15803D] font-semibold bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                  100% Free
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pantry.inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-[#CBD5E1] bg-white flex items-center justify-between text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span className="font-semibold text-[#111C2D]">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5128] bg-[#E8EFE9] px-2 py-0.5 rounded-md shrink-0">
                      In Stock
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Can't travel? Doorstep Delivery Offer */}
            <div className="bg-[#DCFCE7]/50 border border-[#166534]/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-[#14381B]">Can't make it in person?</h5>
                  <p className="text-xs text-[#166534]">
                    Our volunteer drivers deliver free emergency grocery boxes directly to your doorstep.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRequestDelivery(pantry);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#166534] text-white text-xs font-bold hover:bg-[#14381B] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                Request Free Home Drop-Off
              </button>
            </div>
          </div>

          {/* Bottom Action Footer with 52px Primary Button */}
          <div className="p-4 bg-[#F4F7F4] border-t border-[#CBD5E1] flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                onClose();
                onNavigate(pantry);
              }}
              className="flex-1 min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm px-6 flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions to Drive-Thru</span>
            </button>

            <a
              href={`tel:${pantry.phone}`}
              className="min-h-[52px] px-5 rounded-full border-1.5 border-[#1E5128] text-[#1E5128] font-bold text-sm hover:bg-[#E8EFE9] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Hub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Queue Reporter Modal */}
      {showQueueReporter && (
        <QueueReporterModal
          pantry={pantry}
          onClose={() => setShowQueueReporter(false)}
          onSubmit={(pId, cars, wait, tr) => {
            onUpdateQueue(pId, cars, wait, tr);
            setShowQueueReporter(false);
          }}
        />
      )}
    </>
  );
};
