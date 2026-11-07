import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  PhoneCall,
  DollarSign,
  Users,
  Home,
  Baby,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroCopyBanner } from './MicroCopyBanner';
import { api } from '../services/api';

export const SnapScreener: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(1800);
  const [rentMortgage, setRentMortgage] = useState<number>(950);
  const [childcareOrMedical, setChildcareOrMedical] = useState<number>(200);
  const [hasChildrenUnder5, setHasChildrenUnder5] = useState<boolean>(true);
  const [hasSeniorsOrDisabled, setHasSeniorsOrDisabled] = useState<boolean>(false);
  const [estimatedResult, setEstimatedResult] = useState<{
    snapMonthly: number;
    wicMonthly: number;
    eligible: boolean;
    doubleUpBucks: number;
  } | null>(null);

  // Calculate estimated SNAP & WIC benefit via backend API with fallback
  const handleCalculate = async () => {
    try {
      const apiResult = await api.estimateSnap({
        householdSize,
        monthlyIncome,
        rentMortgage,
        childcareOrMedical,
        hasChildrenUnder5,
        hasSeniorsOrDisabled
      });

      if (apiResult) {
        setEstimatedResult({
          snapMonthly: apiResult.estimatedSnapMonthly,
          wicMonthly: apiResult.wicMonthly,
          eligible: true,
          doubleUpBucks: apiResult.doubleUpBucks
        });
        setStep(3);
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#1E5128', '#D97706', '#8CC38F', '#F59E0B']
          });
        } catch {
          // ignore
        }
        return;
      }
    } catch (e) {
      console.warn('Using client-side calculation fallback:', e);
    }

    // Client-side fallback if server unreachable
    const maxAllotments: { [key: number]: number } = {
      1: 292, 2: 536, 3: 768, 4: 975, 5: 1158, 6: 1390, 7: 1536, 8: 1756
    };
    const maxBenefit = maxAllotments[Math.min(8, householdSize)] || (1756 + (householdSize - 8) * 220);
    const standardDeduction = householdSize <= 3 ? 200 : 225;
    const earnedDeduction = monthlyIncome * 0.2;
    const totalDeductions = standardDeduction + earnedDeduction + (rentMortgage * 0.4) + childcareOrMedical;
    const netIncome = Math.max(0, monthlyIncome - totalDeductions);
    const expectedContribution = netIncome * 0.3;
    const estimatedSnap = Math.max(95, Math.min(maxBenefit, Math.round(maxBenefit - expectedContribution)));
    const wicAmount = hasChildrenUnder5 ? 120 : 0;
    const doubleUpAmount = 80;

    setEstimatedResult({
      snapMonthly: estimatedSnap,
      wicMonthly: wicAmount,
      eligible: true,
      doubleUpBucks: doubleUpAmount
    });

    setStep(3);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1E5128', '#D97706', '#8CC38F', '#F59E0B']
      });
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setStep(1);
    setEstimatedResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title & Introduction Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#1E5128]/10 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111C2D]">
              Dignified SNAP & Food Benefits Pre-Screener
            </h2>
            <p className="text-xs sm:text-sm text-[#414940]">
              Discover how much monthly grocery money your household qualifies for in under 60 seconds.
            </p>
          </div>
        </div>

        {/* Harvest Warmth Reassurance Microcopy */}
        <MicroCopyBanner
          icon="shield"
          text="100% Confidential & Free from Bureaucracy"
          subtext="We never share your personal information with immigration or state agencies. Checking eligibility is completely anonymous and never affects public charge or legal status."
          className="mt-4"
        />

        {/* Stepper Progress */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E8EFE9]">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step >= 1 ? 'bg-[#1E5128] text-white' : 'bg-[#E8EFE9] text-[#71796F]'
              }`}
            >
              1
            </span>
            <span className="text-xs font-semibold text-[#111C2D] hidden sm:inline">Household</span>
          </div>
          <div className={`h-1 flex-1 mx-3 rounded-full ${step >= 2 ? 'bg-[#1E5128]' : 'bg-[#E8EFE9]'}`} />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step >= 2 ? 'bg-[#1E5128] text-white' : 'bg-[#E8EFE9] text-[#71796F]'
              }`}
            >
              2
            </span>
            <span className="text-xs font-semibold text-[#111C2D] hidden sm:inline">Income & Housing</span>
          </div>
          <div className={`h-1 flex-1 mx-3 rounded-full ${step >= 3 ? 'bg-[#1E5128]' : 'bg-[#E8EFE9]'}`} />
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                step === 3 ? 'bg-[#1E5128] text-white' : 'bg-[#E8EFE9] text-[#71796F]'
              }`}
            >
              3
            </span>
            <span className="text-xs font-semibold text-[#111C2D] hidden sm:inline">Your Benefits</span>
          </div>
        </div>
      </div>

      {/* Step 1: Household Information */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#1E5128]/10 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#111C2D] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1E5128]" />
              <span>Step 1: Who eats with you at home?</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#414940] mt-1">
              Count everyone who lives together and prepares food together.
            </p>
          </div>

          {/* Household Size Selector */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-2">
              Total Household Members:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setHouseholdSize(num)}
                  className={`h-13 rounded-xl font-bold text-base transition-all border cursor-pointer ${
                    householdSize === num
                      ? 'bg-[#1E5128] text-white border-[#1E5128] shadow-xs scale-105'
                      : 'bg-[#F4F7F4] text-[#111C2D] border-[#CBD5E1] hover:bg-[#E8EFE9]'
                  }`}
                >
                  {num}{num === 8 ? '+' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#71796F] mt-2">
              * Include yourself, children, relatives, and roommates sharing grocery meals.
            </p>
          </div>

          {/* Special Household Questions (WIC / Senior) */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#CBD5E1] bg-[#F4F7F4] hover:bg-[#E8EFE9]/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={hasChildrenUnder5}
                onChange={(e) => setHasChildrenUnder5(e.target.checked)}
                className="w-6 h-6 rounded-md accent-[#1E5128] mt-0.5"
              />
              <div className="text-sm">
                <span className="font-bold text-[#111C2D] flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-[#D97706]" />
                  Household has pregnant members or children under age 5
                </span>
                <span className="text-xs text-[#71796F] block mt-0.5">
                  Qualifies for additional monthly WIC nutrition vouchers (milk, cheese, eggs, fresh produce).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#CBD5E1] bg-[#F4F7F4] hover:bg-[#E8EFE9]/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={hasSeniorsOrDisabled}
                onChange={(e) => setHasSeniorsOrDisabled(e.target.checked)}
                className="w-6 h-6 rounded-md accent-[#1E5128] mt-0.5"
              />
              <div className="text-sm">
                <span className="font-bold text-[#111C2D] flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-[#1E5128]" />
                  Household has adults age 60+ or anyone receiving disability benefits
                </span>
                <span className="text-xs text-[#71796F] block mt-0.5">
                  Unlocks higher medical expense deductions and simplified senior food box programs.
                </span>
              </div>
            </label>
          </div>

          {/* Next Button (52px height) */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm px-8 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Next: Income & Housing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Income and Deductions */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#1E5128]/10 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-lg font-bold text-[#111C2D] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#1E5128]" />
              <span>Step 2: Approximate Monthly Income & Expenses</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#414940] mt-1">
              Ballpark figures are fine! Expenses like rent, utilities, and childcare significantly increase your SNAP grocery allocation.
            </p>
          </div>

          {/* Monthly Income Slider & Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="est-income" className="text-sm font-bold text-[#111C2D]">
                Total Monthly Household Income (before taxes):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[#71796F] font-bold">$</span>
                <input
                  id="est-income"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 pl-6 pr-3 py-1.5 text-right font-black text-sm rounded-lg border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E5128] focus:outline-hidden"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
              className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#1E5128]"
            />
            <p className="text-xs text-[#71796F]">
              Include wages, gig work, disability, social security, or child support. If $0, enter 0.
            </p>
          </div>

          {/* Housing Expenses */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label htmlFor="est-rent" className="text-sm font-bold text-[#111C2D] flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#D97706]" />
                Rent or Mortgage + Utilities Paid Each Month:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[#71796F] font-bold">$</span>
                <input
                  id="est-rent"
                  type="number"
                  value={rentMortgage}
                  onChange={(e) => setRentMortgage(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 pl-6 pr-3 py-1.5 text-right font-black text-sm rounded-lg border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E5128] focus:outline-hidden"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="3500"
              step="50"
              value={rentMortgage}
              onChange={(e) => setRentMortgage(parseInt(e.target.value))}
              className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#D97706]"
            />
            <p className="text-xs text-[#71796F]">
              High rent lowers your net income, meaning a bigger grocery card allotment.
            </p>
          </div>

          {/* Childcare / Medical Expenses */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label htmlFor="est-childcare" className="text-sm font-bold text-[#111C2D]">
                Out-of-Pocket Childcare, Caregiver or Medical Costs:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[#71796F] font-bold">$</span>
                <input
                  id="est-childcare"
                  type="number"
                  value={childcareOrMedical}
                  onChange={(e) => setChildcareOrMedical(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 pl-6 pr-3 py-1.5 text-right font-black text-sm rounded-lg border border-[#CBD5E1] focus:ring-2 focus:ring-[#1E5128] focus:outline-hidden"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1500"
              step="25"
              value={childcareOrMedical}
              onChange={(e) => setChildcareOrMedical(parseInt(e.target.value))}
              className="w-full h-2 bg-[#CBD5E1] rounded-lg appearance-none cursor-pointer accent-[#1E5128]"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-[#E8EFE9]">
            <button
              onClick={() => setStep(1)}
              className="min-h-[48px] px-6 rounded-full border border-[#CBD5E1] text-[#414940] hover:bg-[#F4F7F4] font-bold text-sm cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              className="min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm px-8 flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#8CC38F]" />
              <span>Calculate My Estimated Benefits</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Estimated Results Card */}
      {step === 3 && estimatedResult && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#1E5128]/30 shadow-lg space-y-6 animate-in zoom-in-95">
          <div className="text-center max-w-lg mx-auto">
            <span className="bg-[#DCFCE7] text-[#166534] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-block mb-3 border border-[#166534]/20">
              Estimated Monthly Food Assistance
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#111C2D]">
              Up to <span className="text-[#1E5128]">${estimatedResult.snapMonthly + estimatedResult.wicMonthly}</span> / month
            </h3>
            <p className="text-sm text-[#414940] mt-2">
              For your household of <strong>{householdSize}</strong> people loaded directly onto an electronic EBT card every single month.
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="bg-[#F4F7F4] p-4 rounded-xl border border-[#1E5128]/20">
              <span className="text-xs font-bold text-[#1E5128] uppercase tracking-wide">SNAP (Food Stamps)</span>
              <p className="text-2xl font-black text-[#111C2D] mt-1">${estimatedResult.snapMonthly} <span className="text-xs font-normal text-[#71796F]">/mo</span></p>
              <p className="text-[11px] text-[#414940] mt-1">Accepted at all major grocery stores, superstores & bodegas.</p>
            </div>

            {hasChildrenUnder5 ? (
              <div className="bg-[#FEF3C7] p-4 rounded-xl border border-[#D97706]/30">
                <span className="text-xs font-bold text-[#D97706] uppercase tracking-wide">WIC Benefits</span>
                <p className="text-2xl font-black text-[#111C2D] mt-1">${estimatedResult.wicMonthly} <span className="text-xs font-normal text-[#71796F]">/mo</span></p>
                <p className="text-[11px] text-[#414940] mt-1">Extra dedicated funds for milk, fresh fruits, veggies & baby cereals.</p>
              </div>
            ) : (
              <div className="bg-[#F4F7F4] p-4 rounded-xl border border-[#CBD5E1]">
                <span className="text-xs font-bold text-[#71796F] uppercase tracking-wide">WIC Nutrition</span>
                <p className="text-base font-bold text-[#71796F] mt-1">Available if Expecting</p>
                <p className="text-[11px] text-[#71796F] mt-1">For infants & expectant parents.</p>
              </div>
            )}

            <div className="bg-[#DCFCE7] p-4 rounded-xl border border-[#166534]/20">
              <span className="text-xs font-bold text-[#166534] uppercase tracking-wide">Double Up Food Bucks</span>
              <p className="text-2xl font-black text-[#111C2D] mt-1">+${estimatedResult.doubleUpBucks} <span className="text-xs font-normal text-[#71796F]">/mo</span></p>
              <p className="text-[11px] text-[#414940] mt-1">Matches your EBT dollars $1-for-$1 on fresh local farmer produce.</p>
            </div>
          </div>

          {/* Reassurance Banner */}
          <MicroCopyBanner
            icon="heart"
            text="You have earned this support."
            subtext="These benefits are funded by our community taxes specifically to ensure every family eats healthy meals without financial distress. Using benefits never takes food away from anyone else."
          />

          {/* Next Steps Buttons */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-[#111C2D]">How to apply with zero hassle:</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Connect with Community Navigator */}
              <div className="p-4 rounded-2xl border-2 border-[#1E5128] bg-[#F4F7F4] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#1E5128] font-bold text-sm mb-1">
                    <HeartHandshake className="w-5 h-5" />
                    <span>Free Community Navigator</span>
                  </div>
                  <p className="text-xs text-[#414940]">
                    A bilingual neighbor advocate will call you, help gather documents, and submit your application together with you for free.
                  </p>
                </div>
                <a
                  href="tel:211"
                  className="mt-4 min-h-[48px] bg-[#1E5128] hover:bg-[#14381B] text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call (800) 555-SNAP Free</span>
                </a>
              </div>

              {/* Option B: Apply Online Directly */}
              <div className="p-4 rounded-2xl border border-[#CBD5E1] bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#111C2D] font-bold text-sm mb-1">
                    <ExternalLink className="w-4 h-4 text-[#D97706]" />
                    <span>Official State Portal</span>
                  </div>
                  <p className="text-xs text-[#414940]">
                    Apply directly on the official state Department of Social Services portal. Takes ~15 minutes.
                  </p>
                </div>
                <a
                  href="https://www.fns.usda.gov/snap/state-directory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 min-h-[48px] border-1.5 border-[#1E5128] hover:bg-[#E8EFE9] text-[#1E5128] font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all"
                >
                  <span>Open State Application</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Reset link */}
          <div className="text-center pt-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-[#71796F] hover:text-[#1E5128] font-semibold cursor-pointer underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recalculate with different numbers</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
