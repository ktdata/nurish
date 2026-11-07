/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Car,
  Package,
  Sparkles,
  Heart,
  Navigation,
  FileCheck2,
  BookOpen,
  ArrowRight,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  Radio,
  RefreshCw,
  Code
} from 'lucide-react';
import { AppMode, NeighborTab, Language, Pantry, DeliveryRequest, VolunteerShift, BadgeType, UnderprivilegedZone } from './types';
import { INITIAL_PANTRIES, INITIAL_DELIVERY_REQUESTS, INITIAL_VOLUNTEER_SHIFTS, TRANSLATIONS } from './data/mockData';
import { api, CommunityFridge } from './services/api';
import { Header } from './components/Header';
import { PantryCard } from './components/PantryCard';
import { PantryModal } from './components/PantryModal';
import { SnapScreener } from './components/SnapScreener';
import { DeliveryRequestForm } from './components/DeliveryRequestForm';
import { VolunteerPortal } from './components/VolunteerPortal';
import { InteractiveMapModal } from './components/InteractiveMapModal';
import { CommunityResources } from './components/CommunityResources';
import { PlugAndPlayMap } from './components/PlugAndPlayMap';

export default function App() {
  const [mode, setMode] = useState<AppMode>('neighbors');
  const [neighborTab, setNeighborTab] = useState<NeighborTab>('pantries');
  const [language, setLanguage] = useState<Language>('en');

  // Check if iframe embed mode is requested
  const isEmbedMode = typeof window !== 'undefined' && window.location.search.includes('view=map_embed');

  // Directory View Mode: 'grid' or 'map'
  const [pantryViewMode, setPantryViewMode] = useState<'grid' | 'map'>('grid');

  // Core data states
  const [pantries, setPantries] = useState<Pantry[]>(INITIAL_PANTRIES);
  const [fridges, setFridges] = useState<CommunityFridge[]>([]);
  const [vulnerabilityZones, setVulnerabilityZones] = useState<UnderprivilegedZone[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>(INITIAL_DELIVERY_REQUESTS);
  const [shifts, setShifts] = useState<VolunteerShift[]>(INITIAL_VOLUNTEER_SHIFTS);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Search and filter states for Pantries
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open_now' | BadgeType>('all');

  // Modals
  const [selectedPantry, setSelectedPantry] = useState<Pantry | null>(null);
  const [navigatingPantry, setNavigatingPantry] = useState<Pantry | null>(null);
  const [preselectedDeliveryPantry, setPreselectedDeliveryPantry] = useState<Pantry | null>(null);

  const t = TRANSLATIONS[language];

  // Load live accurate data from Backend REST API
  const loadDataFromApi = async () => {
    setIsLoadingApi(true);
    try {
      const [apiPantries, apiFridges, apiZones, apiDeliveries, apiShifts] = await Promise.all([
        api.getPantries(),
        api.getFridges(),
        api.getVulnerabilityZones(),
        api.getDeliveries(),
        api.getShifts()
      ]);

      if (apiPantries && apiPantries.length > 0) setPantries(apiPantries);
      if (apiFridges && apiFridges.length > 0) setFridges(apiFridges);
      if (apiZones && apiZones.length > 0) setVulnerabilityZones(apiZones);
      if (apiDeliveries && apiDeliveries.length > 0) setDeliveries(apiDeliveries);
      if (apiShifts && apiShifts.length > 0) setShifts(apiShifts);
    } catch (err) {
      console.warn('API sync warning:', err);
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    loadDataFromApi();

    // Attach Firebase Real-time listeners for live synchronization
    let unsubPantries: (() => void) | undefined;
    let unsubDeliveries: (() => void) | undefined;
    let unsubShifts: (() => void) | undefined;

    import('./services/firebase').then(
      ({ subscribeToPantries, subscribeToDeliveryRequests, subscribeToVolunteerShifts }) => {
        try {
          unsubPantries = subscribeToPantries((updatedPantries) => {
            if (updatedPantries && updatedPantries.length > 0) {
              setPantries((prev) => {
                const map = new Map(prev.map((p) => [p.id, p]));
                updatedPantries.forEach((p) => map.set(p.id, { ...map.get(p.id), ...p }));
                return Array.from(map.values());
              });
            }
          });

          unsubDeliveries = subscribeToDeliveryRequests((updatedDeliveries) => {
            if (updatedDeliveries && updatedDeliveries.length > 0) {
              setDeliveries(updatedDeliveries);
            }
          });

          unsubShifts = subscribeToVolunteerShifts((updatedShifts) => {
            if (updatedShifts && updatedShifts.length > 0) {
              setShifts(updatedShifts);
            }
          });
        } catch (err) {
          console.warn('Firebase real-time sync warning:', err);
        }
      }
    );

    return () => {
      if (unsubPantries) unsubPantries();
      if (unsubDeliveries) unsubDeliveries();
      if (unsubShifts) unsubShifts();
    };
  }, []);

  // Filter pantries
  const filteredPantries = useMemo(() => {
    return pantries.filter((pantry) => {
      // Search query matching
      const matchesSearch =
        searchQuery === '' ||
        pantry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pantry.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pantry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pantry.organization.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter pill matching
      if (activeFilter === 'all') return true;
      if (activeFilter === 'open_now') return pantry.openToday;
      if (activeFilter === 'food_desert_relief') {
        return (
          pantry.badges.includes('food_desert_relief') ||
          pantry.servesUnderprivilegedArea ||
          pantry.neighborhood.toLowerCase().includes('parramore') ||
          pantry.neighborhood.toLowerCase().includes('mercy') ||
          pantry.neighborhood.toLowerCase().includes('pine hills') ||
          pantry.neighborhood.toLowerCase().includes('obt') ||
          pantry.neighborhood.toLowerCase().includes('holden') ||
          pantry.neighborhood.toLowerCase().includes('azalea')
        );
      }
      return pantry.badges.includes(activeFilter as BadgeType);
    });
  }, [pantries, searchQuery, activeFilter]);

  // Handle queue update via API and Firebase
  const handleUpdateQueue = async (
    pantryId: string,
    cars: number,
    waitMinutes: number,
    trend: 'speeding_up' | 'stable' | 'slowing_down'
  ) => {
    // 1. Optimistic local update
    setPantries((prev) =>
      prev.map((p) =>
        p.id === pantryId
          ? {
              ...p,
              queueCars: cars,
              queueWaitMinutes: waitMinutes,
              queueTrend: trend,
              lastQueueUpdate: 'Just now'
            }
          : p
      )
    );
    if (selectedPantry && selectedPantry.id === pantryId) {
      setSelectedPantry((prev) =>
        prev
          ? {
              ...prev,
              queueCars: cars,
              queueWaitMinutes: waitMinutes,
              queueTrend: trend,
              lastQueueUpdate: 'Just now'
            }
          : null
      );
    }

    // 2. Persist to Backend API & Firebase Firestore
    try {
      await api.updateQueue(pantryId, cars, waitMinutes, trend);
      const { submitFirestoreQueueReport } = await import('./services/firebase');
      await submitFirestoreQueueReport(pantryId, cars, waitMinutes, trend);
    } catch (e) {
      console.warn('Queue update sync:', e);
    }
  };

  // Handle inventory toggle via API
  const handleToggleInventory = async (pantryId: string, itemId: string) => {
    setPantries((prev) =>
      prev.map((p) => {
        if (p.id !== pantryId) return p;
        return {
          ...p,
          inventory: p.inventory.map((inv) =>
            inv.id === itemId ? { ...inv, inStock: !inv.inStock } : inv
          )
        };
      })
    );
    await api.toggleInventory(pantryId, itemId);
  };

  // Handle shift claim via API and Firebase
  const handleClaimShift = async (shiftId: string) => {
    const targetShift = shifts.find((s) => s.id === shiftId);
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== shiftId) return s;
        const isClaimed = !s.claimedByCurrentUser;
        return {
          ...s,
          claimedByCurrentUser: isClaimed,
          spotsClaimed: isClaimed ? s.spotsClaimed + 1 : Math.max(0, s.spotsClaimed - 1)
        };
      })
    );
    try {
      await api.claimShift(shiftId);
      if (targetShift) {
        const { claimFirestoreShift } = await import('./services/firebase');
        await claimFirestoreShift(shiftId, targetShift.spotsClaimed);
      }
    } catch (e) {
      console.warn('Shift claim sync:', e);
    }
  };

  // Handle delivery status update via API and Firebase
  const handleUpdateDeliveryStatus = async (
    id: string,
    status: DeliveryRequest['status'],
    proofPhoto?: string
  ) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              ...(proofPhoto ? { proofPhotoUrl: proofPhoto, deliveredAt: 'Just now' } : {})
            }
          : d
      )
    );
    try {
      await api.updateDelivery(id, {
        status,
        ...(proofPhoto ? { proofPhotoUrl: proofPhoto } : {})
      });
      const { updateFirestoreDeliveryStatus } = await import('./services/firebase');
      await updateFirestoreDeliveryStatus(id, status, 'driver-me', 'You (Volunteer Steward)');
    } catch (e) {
      console.warn('Delivery status update sync:', e);
    }
  };

  // Handle new delivery request submitted from neighbor
  const handleNewDeliverySubmitted = async (newReq: DeliveryRequest) => {
    setDeliveries((prev) => [newReq, ...prev]);
    try {
      await api.createDelivery(newReq);
      const { createFirestoreDeliveryRequest } = await import('./services/firebase');
      await createFirestoreDeliveryRequest(newReq);
    } catch (e) {
      console.warn('New delivery sync:', e);
    }
  };

  // Handle assigning delivery from organizer
  const handleAssignDelivery = async (deliveryId: string, driverName: string) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? { ...d, status: 'assigned', assignedDriverName: driverName }
          : d
      )
    );
    try {
      await api.updateDelivery(deliveryId, {
        status: 'assigned',
        assignedDriverName: driverName
      });
      const { updateFirestoreDeliveryStatus } = await import('./services/firebase');
      await updateFirestoreDeliveryStatus(deliveryId, 'assigned', 'driver-manual', driverName);
    } catch (e) {
      console.warn('Assign delivery sync:', e);
    }
  };

  // If standalone embed view is requested via ?view=map_embed, render pure PlugAndPlayMap
  if (isEmbedMode) {
    return (
      <div className="w-full h-screen bg-[#F4F7F4] p-2">
        <PlugAndPlayMap
          pantries={pantries}
          fridges={fridges}
          vulnerabilityZones={vulnerabilityZones}
          deliveries={deliveries}
          onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
          height="100%"
          onSelectPantry={(p) => setSelectedPantry(p)}
          onRequestDelivery={(p) => {
            setPreselectedDeliveryPantry(p);
            setNeighborTab('delivery_request');
          }}
          showEmbedButton={true}
        />
        {selectedPantry && (
          <PantryModal
            pantry={selectedPantry}
            onClose={() => setSelectedPantry(null)}
            onNavigate={(p) => setNavigatingPantry(p)}
            onRequestDelivery={(p) => setPreselectedDeliveryPantry(p)}
            onUpdateQueue={handleUpdateQueue}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${mode === 'volunteers' ? 'bg-[#F0F4FA]' : 'bg-[#F4F7F4]'} flex flex-col`}>
      {/* Universal Header with Mode Switcher & Language Selector */}
      <Header
        mode={mode}
        onModeChange={(m) => setMode(m)}
        language={language}
        onLanguageChange={(l) => setLanguage(l)}
        onEmergencyClick={() => {
          setMode('neighbors');
          setNeighborTab('pantries');
          setActiveFilter('open_now');
          if (pantries[0]) setSelectedPantry(pantries[0]);
        }}
      />

      {/* Cohort 1: Community Neighbors Mode */}
      {mode === 'neighbors' && (
        <div className="flex-1 flex flex-col">
          {/* Sub-Navigation for Neighbors */}
          <nav className="bg-white border-b border-[#CBD5E1] sticky top-[69px] sm:top-[77px] z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto">
              <div className="flex space-x-1 py-2">
                <button
                  onClick={() => setNeighborTab('pantries')}
                  className={`min-h-[44px] px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    neighborTab === 'pantries'
                      ? 'bg-[#1E5128] text-white shadow-xs'
                      : 'text-[#414940] hover:bg-[#E8EFE9]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t.findPantries}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      neighborTab === 'pantries' ? 'bg-[#14381B]' : 'bg-[#E8EFE9]'
                    }`}
                  >
                    {pantries.length}
                  </span>
                </button>

                <button
                  onClick={() => setNeighborTab('snap_screener')}
                  className={`min-h-[44px] px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    neighborTab === 'snap_screener'
                      ? 'bg-[#1E5128] text-white shadow-xs'
                      : 'text-[#414940] hover:bg-[#E8EFE9]'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-[#D97706]" />
                  <span>{t.snapScreener}</span>
                  <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full font-bold">
                    Official USDA
                  </span>
                </button>

                <button
                  onClick={() => setNeighborTab('delivery_request')}
                  className={`min-h-[44px] px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    neighborTab === 'delivery_request'
                      ? 'bg-[#1E5128] text-white shadow-xs'
                      : 'text-[#414940] hover:bg-[#E8EFE9]'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>{t.requestDelivery}</span>
                  <span className="text-[10px] bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full font-bold">
                    Free
                  </span>
                </button>

                <button
                  onClick={() => setNeighborTab('resources')}
                  className={`min-h-[44px] px-4 sm:px-5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    neighborTab === 'resources'
                      ? 'bg-[#1E5128] text-white shadow-xs'
                      : 'text-[#414940] hover:bg-[#E8EFE9]'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t.resources}</span>
                </button>
              </div>

              {/* API Live Sync Status Pill */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-[#1E5128]">
                <span className="inline-flex items-center gap-1.5 bg-[#E8EFE9] px-2.5 py-1 rounded-full text-[11px] font-bold text-[#1E5128]">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                  <span>Live REST API Connected</span>
                </span>
                <span className="text-[11px] font-bold text-[#1E5128] bg-[#E8EFE9] px-2.5 py-1 rounded-full border border-[#1E5128]/20">
                  Digital Food Relief • Replaces 211 Wait
                </span>
              </div>
            </div>
          </nav>

          {/* Main Body per tab */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
            {neighborTab === 'pantries' && (
              <div className="space-y-6">
                {/* Search Bar, View Toggle & Location Guide */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#1E5128]/10 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-5 h-5 text-[#71796F] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full min-h-[52px] pl-11 pr-4 rounded-xl border-1.5 border-[#CBD5E1] bg-white text-sm text-[#111C2D] focus:border-[#1E5128] focus:ring-2 focus:ring-[#E8EFE9] focus:outline-hidden"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3.5 top-4 text-xs font-bold text-[#71796F] hover:text-[#111C2D]"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* View Switcher: Interactive Map vs Grid */}
                    <div className="bg-[#E8EFE9] p-1 rounded-full flex items-center border border-[#1E5128]/15 shrink-0">
                      <button
                        onClick={() => setPantryViewMode('grid')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          pantryViewMode === 'grid'
                            ? 'bg-[#1E5128] text-white shadow-xs'
                            : 'text-[#414940] hover:text-[#111C2D]'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Cards View</span>
                      </button>
                      <button
                        onClick={() => setPantryViewMode('map')}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          pantryViewMode === 'map'
                            ? 'bg-[#1E5128] text-white shadow-xs'
                            : 'text-[#414940] hover:text-[#111C2D]'
                        }`}
                      >
                        <MapIcon className="w-4 h-4" />
                        <span>Plug & Play Map</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Pills with Full Pill Geometry */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                    <span className="text-xs font-bold text-[#71796F] uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" /> Filter:
                    </span>

                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        activeFilter === 'all'
                          ? 'bg-[#1E5128] text-white shadow-xs'
                          : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
                      }`}
                    >
                      All Pantries ({pantries.length})
                    </button>

                    <button
                      onClick={() => setActiveFilter('open_now')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        activeFilter === 'open_now'
                          ? 'bg-[#15803D] text-white shadow-xs'
                          : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
                      }`}
                    >
                      {t.openNow}
                    </button>

                    <button
                      onClick={() => setActiveFilter('food_desert_relief')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        activeFilter === 'food_desert_relief'
                          ? 'bg-[#991B1B] text-white shadow-xs'
                          : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FCA5A5]'
                      }`}
                    >
                      <span>★ Underprivileged Areas</span>
                    </button>

                    <button
                      onClick={() => setActiveFilter('drive_thru')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        activeFilter === 'drive_thru'
                          ? 'bg-[#1E5128] text-white shadow-xs'
                          : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
                      }`}
                    >
                      Drive-Thru Friendly
                    </button>

                    <button
                      onClick={() => setActiveFilter('no_id')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        activeFilter === 'no_id'
                          ? 'bg-[#D97706] text-white shadow-xs'
                          : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
                      }`}
                    >
                      No ID Required
                    </button>

                    <button
                      onClick={() => setActiveFilter('delivery')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        activeFilter === 'delivery'
                          ? 'bg-[#166534] text-white shadow-xs'
                          : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
                      }`}
                    >
                      Delivery Available
                    </button>

                    <button
                      onClick={() => setActiveFilter('hot_meals')}
                      className={`min-h-[38px] px-4 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        activeFilter === 'hot_meals'
                          ? 'bg-[#C2410C] text-white shadow-xs'
                          : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
                      }`}
                    >
                      Hot Meals
                    </button>
                  </div>
                </div>

                {/* VIEW MODE 1: Interactive Plug & Play Map Interface */}
                {pantryViewMode === 'map' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-[#1E5128]" />
                        <h3 className="font-bold text-base text-[#111C2D]">
                          Live Community Food Sovereignty Map
                        </h3>
                        <span className="bg-[#DCFCE7] text-[#166534] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#166534]/20">
                          LibreMaps Powered
                        </span>
                      </div>
                      <p className="text-xs text-[#71796F] hidden sm:block">
                        Click any pin or shaded food desert zone to inspect real-time queue, vulnerability scores, and routes.
                      </p>
                    </div>

                    <PlugAndPlayMap
                      pantries={filteredPantries}
                      fridges={fridges}
                      vulnerabilityZones={vulnerabilityZones}
                      deliveries={deliveries}
                      onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
                      height="580px"
                      onSelectPantry={(p) => setSelectedPantry(p)}
                      onRequestDelivery={(p) => {
                        setPreselectedDeliveryPantry(p);
                        setNeighborTab('delivery_request');
                      }}
                      showEmbedButton={true}
                    />
                  </div>
                )}

                {/* VIEW MODE 2: Standard Cards Grid */}
                {pantryViewMode === 'grid' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-base text-[#111C2D]">
                        Distribution Sites Near You ({filteredPantries.length})
                      </h3>
                      <button
                        onClick={() => setPantryViewMode('map')}
                        className="text-xs font-bold text-[#1E5128] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>Switch to Interactive Map</span>
                      </button>
                    </div>

                    {filteredPantries.length === 0 ? (
                      <div className="bg-white rounded-2xl p-10 text-center border border-[#CBD5E1]">
                        <Search className="w-10 h-10 text-[#71796F] mx-auto mb-2" />
                        <h4 className="font-bold text-base text-[#111C2D]">No matching pantries found</h4>
                        <p className="text-xs text-[#414940] mt-1">
                          Try clearing your search query or choosing "All Pantries" filter.
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setActiveFilter('all');
                          }}
                          className="mt-4 px-5 py-2 rounded-full bg-[#1E5128] text-white text-xs font-bold cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPantries.map((pantry) => (
                          <PantryCard
                            key={pantry.id}
                            pantry={pantry}
                            onSelect={(p) => setSelectedPantry(p)}
                            onNavigate={(p) => setNavigatingPantry(p)}
                            onRequestDelivery={(p) => {
                              setPreselectedDeliveryPantry(p);
                              setNeighborTab('delivery_request');
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Direct Mutual Aid Grocery Banner */}
                <div className="bg-[#E8EFE9] rounded-2xl p-6 sm:p-8 border border-[#1E5128]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#1E5128] font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      <span>Unable to leave home or waiting in line?</span>
                    </div>
                    <h4 className="text-xl font-bold text-[#111C2D]">
                      Free Mutual Aid Grocery Delivery to Your Doorstep
                    </h4>
                    <p className="text-xs sm:text-sm text-[#414940] max-w-xl">
                      Our volunteer drivers bring fresh farm produce, whole milk, grains, and pantry staples straight to your door with zero delivery fees or document checks.
                    </p>
                  </div>
                  <button
                    onClick={() => setNeighborTab('delivery_request')}
                    className="min-h-[52px] bg-[#1E5128] hover:bg-[#14381B] active:scale-[0.98] text-white font-bold rounded-full text-sm px-6 flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
                  >
                    <span>Request Free Delivery Box</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {neighborTab === 'snap_screener' && <SnapScreener />}

            {neighborTab === 'delivery_request' && (
              <DeliveryRequestForm
                preselectedPantry={preselectedDeliveryPantry}
                onSubmitted={handleNewDeliverySubmitted}
                activeRequests={deliveries}
              />
            )}

            {neighborTab === 'resources' && <CommunityResources />}
          </main>
        </div>
      )}

      {/* Cohort 2: Volunteer Driver & Logistics Portal */}
      {mode === 'volunteers' && (
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          <VolunteerPortal
            deliveries={deliveries}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            shifts={shifts}
            onClaimShift={handleClaimShift}
            pantries={pantries}
            onUpdatePantryQueue={handleUpdateQueue}
            onTogglePantryInventory={handleToggleInventory}
            onAssignDelivery={handleAssignDelivery}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#CBD5E1] py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71796F]">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#1E5128]" />
            <span className="font-bold text-[#111C2D]">NourishTogether</span>
            <span>— Rooted in unconditional community dignity, mutual aid & food justice.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#15803D] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#15803D]" />
              API Connected
            </span>
            <span>•</span>
            <button
              onClick={() => setMode(mode === 'neighbors' ? 'volunteers' : 'neighbors')}
              className="text-[#1E5128] font-bold underline hover:text-[#14381B] cursor-pointer"
            >
              Switch to {mode === 'neighbors' ? 'Driver Portal' : 'Neighbor Food Access'}
            </button>
            <span>•</span>
            <a href="tel:211" className="hover:underline font-semibold text-[#111C2D]">
              Emergency Food Line: 211
            </a>
          </div>
        </div>
      </footer>

      {/* Detail Modals */}
      {selectedPantry && (
        <PantryModal
          pantry={selectedPantry}
          onClose={() => setSelectedPantry(null)}
          onNavigate={(p) => setNavigatingPantry(p)}
          onRequestDelivery={(p) => {
            setPreselectedDeliveryPantry(p);
            setNeighborTab('delivery_request');
          }}
          onUpdateQueue={handleUpdateQueue}
        />
      )}

      {navigatingPantry && (
        <InteractiveMapModal
          pantry={navigatingPantry}
          onClose={() => setNavigatingPantry(null)}
        />
      )}
    </div>
  );
}
