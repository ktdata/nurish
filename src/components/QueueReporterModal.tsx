import React, { useState } from 'react';
import { X, Car, Clock, CheckCircle2, TrendingUp, TrendingDown, Minus, Heart } from 'lucide-react';
import { Pantry } from '../types';

interface QueueReporterModalProps {
  pantry: Pantry;
  onClose: () => void;
  onSubmit: (pantryId: string, cars: number, waitMinutes: number, trend: 'speeding_up' | 'stable' | 'slowing_down') => void;
}

export const QueueReporterModal: React.FC<QueueReporterModalProps> = ({
  pantry,
  onClose,
  onSubmit
}) => {
  const [cars, setCars] = useState(pantry.queueCars);
  const [waitMinutes, setWaitMinutes] = useState(pantry.queueWaitMinutes);
  const [trend, setTrend] = useState<'speeding_up' | 'stable' | 'slowing_down'>(pantry.queueTrend);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(pantry.id, cars, waitMinutes, trend);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-md rounded-2xl shadow-2xl border border-[#1E5128]/15 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1E5128] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#8CC38F]" />
            <h3 className="font-bold text-base">Community Queue Update</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-[#111C2D]">Thank you for supporting neighbors!</h4>
            <p className="text-sm text-[#414940] mt-1">
              Your real-time update helps everyone plan their visit with ease and dignity.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-[#71796F] uppercase tracking-wider">{pantry.name}</p>
              <p className="text-sm text-[#414940] mt-0.5">
                Are you currently in line or volunteering here? Share the current queue speed to help neighbors.
              </p>
            </div>

            {/* Cars Slider */}
            <div className="bg-[#F4F7F4] p-3.5 rounded-xl border border-[#CBD5E1]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#1E5128]" />
                  Cars currently in line:
                </label>
                <span className="text-lg font-black text-[#1E5128] bg-white px-3 py-0.5 rounded-full border border-[#CBD5E1]">
                  {cars} cars
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={cars}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCars(val);
                  setWaitMinutes(Math.max(2, Math.round(val * 1.8)));
                }}
                className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#1E5128]"
              />
              <div className="flex justify-between text-[11px] text-[#71796F] mt-1">
                <span>0 (No line)</span>
                <span>10 cars (~15 min)</span>
                <span>25+ cars</span>
              </div>
            </div>

            {/* Estimated Minutes */}
            <div className="bg-[#F4F7F4] p-3.5 rounded-xl border border-[#CBD5E1]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-[#111C2D] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  Estimated wait time:
                </label>
                <span className="text-lg font-black text-[#D97706] bg-white px-3 py-0.5 rounded-full border border-[#CBD5E1]">
                  ~{waitMinutes} mins
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="2"
                value={waitMinutes}
                onChange={(e) => setWaitMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#D97706]"
              />
            </div>

            {/* Trend selector */}
            <div>
              <label className="text-xs font-bold text-[#414940] uppercase tracking-wider block mb-2">
                Queue Speed Trend
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTrend('speeding_up')}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    trend === 'speeding_up'
                      ? 'bg-[#DCFCE7] border-[#15803D] text-[#15803D] ring-2 ring-[#15803D]/20'
                      : 'bg-white border-[#CBD5E1] text-[#414940] hover:bg-[#F4F7F4]'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Moving Fast</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrend('stable')}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    trend === 'stable'
                      ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1] ring-2 ring-[#0284C7]/20'
                      : 'bg-white border-[#CBD5E1] text-[#414940] hover:bg-[#F4F7F4]'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>Steady Flow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTrend('slowing_down')}
                  className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                    trend === 'slowing_down'
                      ? 'bg-[#FEF3C7] border-[#D97706] text-[#B45309] ring-2 ring-[#D97706]/20'
                      : 'bg-white border-[#CBD5E1] text-[#414940] hover:bg-[#F4F7F4]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Building Up</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 text-[#8CC38F]" />
                <span>Publish Real-Time Update</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
