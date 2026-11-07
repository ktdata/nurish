import React from 'react';
import { Car, ShieldCheck, Truck, Sparkles, UtensilsCrossed, Apple, CircleCheck } from 'lucide-react';
import { BadgeType } from '../types';

interface BadgeProps {
  type: BadgeType | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, label, className = '' }) => {
  switch (type) {
    case 'drive_thru':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#E8EFE9] text-[#1E5128] border border-[#1E5128]/10 ${className}`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>{label || 'Drive-Thru Friendly'}</span>
        </span>
      );
    case 'no_id':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/20 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{label || 'No ID Required'}</span>
        </span>
      );
    case 'delivery':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#DCFCE7] text-[#166534] border border-[#166534]/15 ${className}`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>{label || 'Delivery Available'}</span>
        </span>
      );
    case 'shift_open':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#DBEAFE] text-[#1E40AF] border border-[#2563EB]/20 ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse-dot" />
          <span>{label || 'Shift Open'}</span>
        </span>
      );
    case 'hot_meals':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]/20 ${className}`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>{label || 'Hot Meals'}</span>
        </span>
      );
    case 'halal_kosher':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#F3E8FF] text-[#6B21A8] border border-[#9333EA]/20 ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{label || 'Halal & Kosher'}</span>
        </span>
      );
    case 'fresh_produce':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#E0F2FE] text-[#0369A1] border border-[#0284C7]/20 ${className}`}
        >
          <Apple className="w-3.5 h-3.5" />
          <span>{label || 'Farm Fresh Produce'}</span>
        </span>
      );
    case 'food_desert_relief':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-[#FEE2E2] text-[#991B1B] border border-[#EF4444]/25 ${className}`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>{label || 'High-Need Food Desert Hub'}</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8EFE9] text-[#1E293B] ${className}`}
        >
          <CircleCheck className="w-3 h-3 text-[#1E5128]" />
          <span>{label || type}</span>
        </span>
      );
  }
};
