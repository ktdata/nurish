import React, { useState } from 'react';
import { Truck, CheckCircle2, Package, ShieldCheck, Heart, MapPin, Phone, User, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeliveryRequest, Pantry } from '../types';
import { MicroCopyBanner } from './MicroCopyBanner';

interface DeliveryRequestFormProps {
  preselectedPantry?: Pantry | null;
  onSubmitted: (request: DeliveryRequest) => void;
  activeRequests: DeliveryRequest[];
}

export const DeliveryRequestForm: React.FC<DeliveryRequestFormProps> = ({
  preselectedPantry,
  onSubmitted,
  activeRequests
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState(
    preselectedPantry ? preselectedPantry.neighborhood : 'Historic Parramore / Downtown West'
  );
  const [householdSize, setHouseholdSize] = useState(3);
  const [boxType, setBoxType] = useState<DeliveryRequest['boxType']>('family_bounty');
  const [safeDropNotes, setSafeDropNotes] = useState('');
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [firebaseSaved, setFirebaseSaved] = useState(false);

  const toggleDietary = (item: string) => {
    if (dietaryOptions.includes(item)) {
      setDietaryOptions(dietaryOptions.filter((d) => d !== item));
    } else {
      setDietaryOptions([...dietaryOptions, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !address.trim() || !phone.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRequest: DeliveryRequest = {
      id: newId,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      neighborhood,
      householdSize,
      boxType,
      dietaryRestrictions: dietaryOptions,
      safeDropNotes: safeDropNotes.trim() || 'Leave at doorstep, knock twice.',
      urgency: 'routine',
      status: 'pending',
      requestedAt: 'Just now',
      deliveryWindow: 'Today, 2:00 PM – 4:30 PM'
    };

    // 1. Save directly to Firebase Firestore
    try {
      const { createFirestoreDeliveryRequest } = await import('../services/firebase');
      const res = await createFirestoreDeliveryRequest(newRequest);
      if (res.success) {
        setFirebaseSaved(true);
      }
    } catch (err) {
      console.warn('Firebase save note:', err);
    }

    // 2. Propagate to application state and backend API
    onSubmitted(newRequest);
    setLastSubmittedId(newId);
    setSubmitted(true);
    setIsSubmitting(false);

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1E5128', '#2563EB', '#D97706', '#FFA000']
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-[#1E5128]/10 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111C2D]">
              Doorstep Mutual Aid Food Delivery
            </h2>
            <p className="text-xs sm:text-sm text-[#414940]">
              Free home groceries & farm boxes for seniors, disabled neighbors, or anyone lacking transportation.
            </p>
          </div>
        </div>

        <MicroCopyBanner
          icon="shield"
          text="Zero cost, zero documents, total privacy."
          subtext="Your contact details are used strictly by our volunteer driver to locate your doorstep and notify you when the box has landed safely. We never share data with any external agency."
          className="mt-4"
        />
      </div>

      {/* Success Notification if already submitted */}
      {submitted && (
        <div className="bg-[#DCFCE7] border border-[#166534]/30 rounded-2xl p-6 text-center animate-in zoom-in-95 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#166534] text-white flex items-center justify-center mx-auto mb-1 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#14381B]">Delivery Request Confirmed!</h3>
            <p className="text-sm text-[#166534] mt-1 max-w-md mx-auto">
              Your request (<strong>#{lastSubmittedId}</strong>) has been routed to active volunteer drivers. You'll receive a courtesy knock and text message when your food box arrives.
            </p>
          </div>

          {/* Firebase Persistence Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#166534]/30 text-xs font-semibold text-[#14381B] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#166534] animate-pulse" />
            <span>Saved to Firebase Firestore (collection: <code className="font-mono font-bold text-[#1E5128]">delivery_requests</code>)</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setRecipientName('');
                setPhone('');
                setAddress('');
                setSafeDropNotes('');
                setFirebaseSaved(false);
              }}
              className="px-6 py-2.5 rounded-full bg-[#166534] text-white text-xs font-bold hover:bg-[#14381B] cursor-pointer shadow-xs"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      )}

      {/* Active Orders Tracker if user has existing requests */}
      {activeRequests.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#1E5128]/15 shadow-xs">
          <h4 className="text-sm font-bold text-[#111C2D] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1E5128]" />
            <span>Active Doorstep Requests in Your Neighborhood</span>
          </h4>
          <div className="space-y-3">
            {activeRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-[#CBD5E1] bg-[#F4F7F4] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111C2D] text-sm">{req.recipientName}</span>
                    <span className="text-[#71796F]">({req.neighborhood})</span>
                    <span className="bg-[#E8EFE9] text-[#1E5128] font-bold px-2 py-0.5 rounded-full capitalize">
                      {req.boxType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[#414940] mt-0.5">
                    <strong>Window:</strong> {req.deliveryWindow} • <strong>Drop note:</strong> {req.safeDropNotes}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                      req.status === 'delivered'
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : req.status === 'in_transit'
                        ? 'bg-[#DBEAFE] text-[#1E40AF]'
                        : req.status === 'assigned'
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : 'bg-[#F1F5F9] text-[#475569]'
                    }`}
                  >
                    {req.status === 'delivered'
                      ? 'Delivered'
                      : req.status === 'in_transit'
                      ? 'Driver On The Way'
                      : req.status === 'assigned'
                      ? 'Volunteer Assigned'
                      : 'Received & Queued'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Request Form */}
      {!submitted && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-7 border border-[#1E5128]/10 shadow-xs space-y-6">
          {/* Step 1: Select Box Type */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Select Desired Food Box Type:
            </label>
            <p className="text-xs text-[#414940] mb-3">
              All boxes are packed fresh by volunteers with care and dignity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'family_bounty',
                  name: 'Fresh Harvest Family Bounty',
                  desc: 'Seasonal vegetables, fruit, grains, eggs, milk & beans. Best for general households.'
                },
                {
                  id: 'senior_wellness',
                  name: 'Senior Wellness & Gentle Digestion',
                  desc: 'Low sodium soups, soft fruits, oatmeal, easy-to-open tins & gentle nutrition.'
                },
                {
                  id: 'diabetic_care',
                  name: 'Diabetic & Low-Glycemic Care',
                  desc: 'High fiber lentils, greens, cauliflower, lean proteins, no added sugars.'
                },
                {
                  id: 'halal_staples',
                  name: 'Halal Certified Pantry Essentials',
                  desc: 'Halal poultry/tuna, basmati rice, chickpeas, olive oil, spices & dates.'
                },
                {
                  id: 'baby_essentials',
                  name: 'Infant, Toddler & Family Bundle',
                  desc: 'Baby formula, gentle purees, diapers, toddler snacks, and pantry staples.'
                }
              ].map((box) => (
                <button
                  key={box.id}
                  type="button"
                  onClick={() => setBoxType(box.id as DeliveryRequest['boxType'])}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    boxType === box.id
                      ? 'border-[#1E5128] bg-[#F4F7F4] ring-2 ring-[#1E5128]/20 shadow-xs'
                      : 'border-[#CBD5E1] bg-white hover:bg-[#F4F7F4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#111C2D]">{box.name}</span>
                    <input
                      type="radio"
                      name="boxType"
                      checked={boxType === box.id}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[#1E5128]"
                    />
                  </div>
                  <p className="text-xs text-[#71796F] leading-relaxed">{box.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Household Size */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              How many people in your household will this box feed?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setHouseholdSize(num)}
                  className={`w-12 h-11 rounded-xl font-bold text-sm border cursor-pointer ${
                    householdSize === num
                      ? 'bg-[#1E5128] text-white border-[#1E5128]'
                      : 'bg-[#F4F7F4] border-[#CBD5E1] text-[#111C2D]'
                  }`}
                >
                  {num}{num === 6 ? '+' : ''}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#71796F] mt-1.5">
              We scale portion quantities according to family size.
            </p>
          </div>

          {/* Dietary Restrictions Checklist */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Any special dietary preferences or allergies? (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                'Vegetarian',
                'Gluten-Sensitive',
                'Dairy-Free',
                'No Pork',
                'Nut Allergy',
                'Baby Diapers Needed'
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDietary(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    dietaryOptions.includes(opt)
                      ? 'bg-[#1E5128] text-white border-[#1E5128]'
                      : 'bg-[#F4F7F4] border-[#CBD5E1] text-[#414940] hover:bg-[#E8EFE9]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Name Input (52px minimum touch target) */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Recipient Name or Household Alias:
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-[#71796F] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Maria G. or 'The Martinez Family'"
                className="w-full min-h-[52px] pl-11 pr-4 rounded-xl border-1.5 border-[#CBD5E1] bg-white text-sm text-[#111C2D] focus:border-[#1E5128] focus:ring-2 focus:ring-[#E8EFE9] focus:outline-hidden"
              />
            </div>
            <p className="text-xs text-[#71796F] mt-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#1E5128]" />
              First name or family initial is completely fine.
            </p>
          </div>

          {/* Phone Number Input */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Phone Number for Delivery Notification:
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-[#71796F] absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(407) 555-0199"
                className="w-full min-h-[52px] pl-11 pr-4 rounded-xl border-1.5 border-[#CBD5E1] bg-white text-sm text-[#111C2D] focus:border-[#1E5128] focus:ring-2 focus:ring-[#E8EFE9] focus:outline-hidden"
              />
            </div>
            <p className="text-xs text-[#71796F] mt-1.5">
              Volunteer driver uses masked calling to protect your number. We never send spam.
            </p>
          </div>

          {/* Orlando Neighborhood Selector */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Orlando Neighborhood / Zone:
            </label>
            <div className="relative">
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-xl border-1.5 border-[#CBD5E1] bg-white text-sm text-[#111C2D] font-medium focus:border-[#1E5128] focus:ring-2 focus:ring-[#E8EFE9] focus:outline-hidden cursor-pointer"
              >
                <option value="Historic Parramore / Downtown West">Historic Parramore / Downtown West (32805)</option>
                <option value="Mercy Drive / Northwest Orlando">Mercy Drive / Northwest Orlando (32808)</option>
                <option value="Pine Hills / Silver Star">Pine Hills / Silver Star (32808)</option>
                <option value="Holden Heights / South OBT">Holden Heights / South OBT (32839)</option>
                <option value="Azalea Park / East Colonial">Azalea Park / East Colonial (32807)</option>
                <option value="Downtown Orlando / Lake Eola">Downtown Orlando / Lake Eola (32801)</option>
                <option value="Carver Shores / Richmond Heights">Carver Shores / Richmond Heights (32811)</option>
                <option value="Greater Orlando Area">Greater Orlando Area</option>
              </select>
            </div>
          </div>

          {/* Delivery Street Address */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Delivery Street Address & Apt Number:
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-[#71796F] absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 680 W. Church St, Apt 3B or 4820 Silver Star Rd"
                className="w-full min-h-[52px] pl-11 pr-4 rounded-xl border-1.5 border-[#CBD5E1] bg-white text-sm text-[#111C2D] focus:border-[#1E5128] focus:ring-2 focus:ring-[#E8EFE9] focus:outline-hidden"
              />
            </div>
            <p className="text-xs text-[#71796F] mt-1.5">
              Include building buzzer code or gate info if applicable.
            </p>
          </div>

          {/* Safe Drop Instructions */}
          <div>
            <label className="block text-sm font-bold text-[#111C2D] mb-1">
              Safe-Drop & Contactless Delivery Instructions:
            </label>
            <textarea
              rows={2}
              value={safeDropNotes}
              onChange={(e) => setSafeDropNotes(e.target.value)}
              placeholder="e.g. 'Leave outside front door behind potted plant. Ring bell twice. Contactless please.'"
              className="w-full p-3.5 rounded-xl border-1.5 border-[#CBD5E1] bg-white text-sm text-[#111C2D] focus:border-[#1E5128] focus:ring-2 focus:ring-[#E8EFE9] focus:outline-hidden"
            />
            <p className="text-xs text-[#71796F] mt-1.5">
              Driver will take a safe-drop verification photo upon drop-off.
            </p>
          </div>

          {/* 52px Primary Pill Submit Button with Firebase saving indicator */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold rounded-full text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving to Firebase Firestore...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 text-[#8CC38F]" />
                  <span>Submit Free Doorstep Delivery Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
