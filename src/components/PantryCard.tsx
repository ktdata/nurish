import React from 'react';
import { MapPin, Clock, Car, Navigation, ChevronRight, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Pantry } from '../types';
import { Badge } from './Badge';

interface PantryCardProps {
  pantry: Pantry;
  onSelect: (pantry: Pantry) => void;
  onNavigate: (pantry: Pantry) => void;
  onRequestDelivery: (pantry: Pantry) => void;
}

export const PantryCard: React.FC<PantryCardProps> = ({
  pantry,
  onSelect,
  onNavigate,
  onRequestDelivery
}) => {
  const getQueueTrendIcon = () => {
    switch (pantry.queueTrend) {
      case 'speeding_up':
        return (
          <span title="Wait time decreasing">
            <TrendingDown className="w-3.5 h-3.5 text-[#15803D]" />
          </span>
        );
      case 'slowing_down':
        return (
          <span title="Wait time increasing">
            <TrendingUp className="w-3.5 h-3.5 text-[#B45309]" />
          </span>
        );
      default:
        return (
          <span title="Flow is steady">
            <Minus className="w-3.5 h-3.5 text-[#71796F]" />
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#1E5128]/10 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top Image & Status Tag */}
      <div className="relative h-44 w-full bg-[#E8EFE9] overflow-hidden">
        <img
          src={pantry.imageUrl}
          alt={pantry.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Open Status Indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
              pantry.openToday
                ? 'bg-[#15803D] text-white'
                : 'bg-[#64748B] text-white'
            }`}
          >
            {pantry.openToday ? 'Open Today' : 'Closed Today'}
          </span>
          <span className="bg-black/60 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {pantry.distanceMiles} miles away
          </span>
        </div>

        {/* Neighborhood Tag */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-xs uppercase tracking-wider font-semibold opacity-90">{pantry.organization}</p>
          <h3 className="text-lg font-bold drop-shadow-xs text-white leading-snug">{pantry.name}</h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Dignified Badges Row */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {pantry.badges.map((badge) => (
            <Badge key={badge} type={badge} />
          ))}
        </div>

        {/* Location & Hours */}
        <div className="space-y-1.5 text-sm text-[#414940] mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1E5128] shrink-0" />
            <span className="truncate">{pantry.address} ({pantry.neighborhood})</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
            <span className="font-medium text-[#111C2D]">{pantry.hoursToday}</span>
          </div>
        </div>

        {/* Real-Time Drive-Thru Queue Box */}
        {pantry.driveThruLaneActive ? (
          <div className="bg-[#F4F7F4] border border-[#1E5128]/15 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#1E5128] uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#1E5128]" />
                Live Drive-Thru Queue
              </span>
              <span className="flex items-center gap-1 text-[#414940] font-normal lowercase">
                {getQueueTrendIcon()}
                Updated {pantry.lastQueueUpdate}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-bold text-[#111C2D]">{pantry.queueCars}</span>
                <span className="text-xs text-[#414940] ml-1">cars waiting</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#414940]">Est. wait:</span>{' '}
                <span className="text-sm font-bold text-[#15803D]">
                  ~{pantry.queueWaitMinutes} mins
                </span>
              </div>
            </div>
            {/* Visual lane representation */}
            <div className="w-full bg-[#E8EFE9] h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pantry.queueCars > 10 ? 'bg-[#D97706]' : 'bg-[#1E5128]'
                }`}
                style={{ width: `${Math.min(100, (pantry.queueCars / 15) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-[#F0F3FF] border border-[#2563EB]/15 rounded-xl p-3 mb-4 text-xs text-[#1E40AF] flex items-center justify-between">
            <span className="font-semibold">Walk-Up Distribution & Market Style</span>
            <span className="text-slate-600">Quick self-select flow</span>
          </div>
        )}

        {/* Today's Highlighted Items */}
        <div className="mb-5 flex-1">
          <p className="text-xs font-semibold text-[#71796F] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Available Today:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pantry.inventory.slice(0, 3).map((item) => (
              <span
                key={item.id}
                className="text-xs bg-[#E8EFE9] text-[#1E5128] font-medium px-2 py-0.5 rounded-md"
              >
                {item.name.split('(')[0].trim()}
              </span>
            ))}
            {pantry.inventory.length > 3 && (
              <span className="text-xs text-[#71796F] px-1 py-0.5 self-center">
                +{pantry.inventory.length - 3} more items
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons adhering strictly to design system */}
        <div className="pt-2 border-t border-[#E8EFE9] flex items-center gap-2">
          {/* Primary Action Button (rounded-full, 52px height for primary flows) */}
          <button
            onClick={() => onSelect(pantry)}
            className="flex-1 min-h-[48px] sm:min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm px-4 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>View & Queue Info</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Secondary Directions Action */}
          <button
            onClick={() => onNavigate(pantry)}
            aria-label="Get directions to pantry"
            title="Get directions"
            className="w-12 h-12 rounded-full border border-[#1E5128] text-[#1E5128] hover:bg-[#E8EFE9] active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
