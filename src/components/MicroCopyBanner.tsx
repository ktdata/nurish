import React from 'react';
import { HeartHandshake, Sun, ShieldCheck } from 'lucide-react';

interface MicroCopyBannerProps {
  text: string;
  subtext?: string;
  icon?: 'heart' | 'sun' | 'shield';
  className?: string;
}

export const MicroCopyBanner: React.FC<MicroCopyBannerProps> = ({
  text,
  subtext,
  icon = 'sun',
  className = ''
}) => {
  return (
    <div
      className={`bg-[#FEF3C7] border-l-4 border-[#D97706] p-3.5 sm:p-4 rounded-r-xl shadow-xs flex items-start gap-3 text-[#1E293B] ${className}`}
      role="note"
    >
      <div className="shrink-0 text-[#D97706] mt-0.5">
        {icon === 'sun' && <Sun className="w-5 h-5 fill-[#FDE68A]" />}
        {icon === 'heart' && <HeartHandshake className="w-5 h-5" />}
        {icon === 'shield' && <ShieldCheck className="w-5 h-5" />}
      </div>
      <div className="text-sm leading-relaxed">
        <p className="font-semibold text-[#78350F]">{text}</p>
        {subtext && <p className="text-xs text-[#92400E] mt-0.5">{subtext}</p>}
      </div>
    </div>
  );
};
