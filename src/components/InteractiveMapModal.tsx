import React from 'react';
import { X, Navigation, Car, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Pantry } from '../types';

interface InteractiveMapModalProps {
  pantry: Pantry;
  onClose: () => void;
}

export const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({
  pantry,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E293B]/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#1E5128]/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#1E5128] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#8CC38F]" />
            <div>
              <h3 className="font-bold text-base">Route & Drive-Thru Lane Guide</h3>
              <p className="text-xs text-[#8CC38F]">{pantry.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Simulated Map Visualizer Canvas */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-[#CBD5E1] bg-[#E8EFE9] flex items-center justify-center">
            {/* Map Background Grid */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Stylized Streets & Roads */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Main Avenue */}
              <div className="absolute top-1/2 left-0 right-0 h-10 bg-[#CBD5E1] -translate-y-1/2 flex items-center justify-around text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{pantry.address.split(',')[0]}</span>
                <span>Orlando Relief Corridor</span>
              </div>
              {/* Cross Street */}
              <div className="absolute top-0 bottom-0 left-1/3 w-10 bg-[#CBD5E1] flex items-center justify-around flex-col text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="rotate-90">Drive-Thru Lane</span>
              </div>

              {/* Drive-thru Route Line with animated dash */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 50 160 Q 200 160 220 120 T 380 90"
                  fill="none"
                  stroke="#1E5128"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                />
              </svg>

              {/* Destination Hub Pin */}
              <div className="absolute top-16 right-20 sm:right-32 flex flex-col items-center">
                <div className="bg-[#1E5128] text-white p-2 rounded-2xl shadow-lg border-2 border-white animate-bounce flex items-center gap-1.5 text-xs font-bold px-3">
                  <Car className="w-4 h-4 text-[#8CC38F]" />
                  <span>{pantry.name}</span>
                </div>
                <div className="w-3 h-3 bg-[#1E5128] rotate-45 -mt-1.5" />
              </div>

              {/* Starting Point Marker */}
              <div className="absolute bottom-16 left-8 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold shadow-md border border-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Your Location ({pantry.distanceMiles} mi)</span>
              </div>
            </div>

            {/* Map Overlay Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-300 text-xs shadow-xs">
              <span className="font-bold text-[#1E5128]">Drive-Thru Lane Active</span>
              <span className="text-slate-500 ml-1">({pantry.queueCars} cars in line)</span>
            </div>
          </div>

          {/* Drive-Thru Step-by-Step Wayfinding */}
          <div className="bg-[#F4F7F4] p-4 rounded-xl border border-[#CBD5E1] space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#1E5128]">
              Seamless Drive-Thru Queue Steps:
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#1E293B]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E5128] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong>Approach from {pantry.address.split(',')[0]}:</strong> Follow signs for Community Drive-Thru Lane. Volunteers in high-vis vests will wave you in.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E5128] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong>Contactless Trunk Pop:</strong> Simply pop your trunk or unlock your rear door. Volunteers will place boxed produce and groceries directly inside.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1E5128] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong>No ID or Paperwork:</strong> Volunteers will warmly ask if you'd like eggs, milk, or extra fresh greens, with no questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(pantry.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Live GPS in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="min-h-[52px] px-6 rounded-full border border-[#CBD5E1] text-[#414940] hover:bg-[#F4F7F4] font-bold text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
