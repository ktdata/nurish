import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Car,
  Navigation,
  Sparkles,
  Maximize2,
  Minimize2,
  Crosshair,
  Filter,
  Code,
  Check,
  Copy,
  ExternalLink,
  Clock,
  ShieldCheck,
  Utensils,
  Layers,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingDown,
  Building2,
  Users,
  Flame,
  Package,
  X,
  Heart
} from 'lucide-react';
import { Pantry, BadgeType, UnderprivilegedZone, DeliveryRequest } from '../types';
import { CommunityFridge } from '../services/api';

interface PlugAndPlayMapProps {
  pantries: Pantry[];
  fridges?: CommunityFridge[];
  vulnerabilityZones?: UnderprivilegedZone[];
  deliveries?: DeliveryRequest[];
  onSelectPantry?: (pantry: Pantry) => void;
  onRequestDelivery?: (pantry: Pantry) => void;
  onUpdateDeliveryStatus?: (id: string, status: DeliveryRequest['status']) => void;
  className?: string;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  showEmbedButton?: boolean;
}

// LibreMaps Tile Providers (100% libre / open-source cartography)
const LIBRE_TILE_PROVIDERS = {
  voyager: {
    name: 'Libre Positron (Voyager)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  humanitarian: {
    name: 'Libre Humanitarian (HOT)',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team'
  },
  osm_standard: {
    name: 'Libre Standard (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export const BOX_TYPE_INFO: Record<string, { label: string; icon: string; desc: string }> = {
  family_bounty: {
    label: 'Fresh Harvest Family Bounty',
    icon: '🥕',
    desc: 'Seasonal fresh Florida citrus, sweet corn, vegetables, eggs, dairy, whole grains & beans.'
  },
  senior_wellness: {
    label: 'Senior Wellness & Gentle Digestion',
    icon: '🥣',
    desc: 'Low sodium vegetable soups, soft fruit, rolled oats, easy-open tins & gentle nutritional staples.'
  },
  diabetic_care: {
    label: 'Diabetic & Low-Glycemic Care',
    icon: '🥗',
    desc: 'High fiber lentils, greens, cauliflower, lean poultry/tuna, beans, zero added sugar items.'
  },
  halal_staples: {
    label: 'Halal Certified Pantry Essentials',
    icon: '🌙',
    desc: 'Halal certified poultry & canned tuna, basmati rice, chickpeas, olive oil, lentils & dates.'
  },
  baby_essentials: {
    label: 'Infant, Toddler & Family Bundle',
    icon: '🍼',
    desc: 'Infant formula, gentle purees, diapers, toddler snacks, and high-nutrient family groceries.'
  }
};

export const getOrlandoDropCoords = (d: DeliveryRequest, index: number = 0): [number, number] => {
  if (d.coordinates && typeof d.coordinates.lat === 'number' && typeof d.coordinates.lng === 'number') {
    return [d.coordinates.lat, d.coordinates.lng];
  }
  const n = (d.neighborhood || d.address || '').toLowerCase();
  if (n.includes('parramore') || n.includes('church')) return [28.5395 + (index * 0.0018), -81.3905 + (index * 0.0015)];
  if (n.includes('mercy') || n.includes('northwest')) return [28.5690 + (index * 0.002), -81.4285 + (index * 0.002)];
  if (n.includes('pine hills') || n.includes('silver star')) return [28.5840 + (index * 0.0018), -81.4520 + (index * 0.002)];
  if (n.includes('obt') || n.includes('holden') || n.includes('blossom')) return [28.5100 + (index * 0.002), -81.3990 + (index * 0.0015)];
  if (n.includes('azalea') || n.includes('semoran') || n.includes('colonial')) return [28.5440 + (index * 0.0015), -81.3120 + (index * 0.002)];
  if (n.includes('eola') || n.includes('rosalind') || n.includes('downtown')) return [28.5450 + (index * 0.0015), -81.3760 + (index * 0.0015)];
  if (n.includes('carver') || n.includes('richmond')) return [28.5230 + (index * 0.002), -81.4420 + (index * 0.002)];
  return [28.5383 + (index * 0.004) - 0.006, -81.3792 + (index * 0.005) - 0.008];
};

export const PlugAndPlayMap: React.FC<PlugAndPlayMapProps> = ({
  pantries,
  fridges = [],
  vulnerabilityZones = [],
  deliveries = [],
  onSelectPantry,
  onRequestDelivery,
  onUpdateDeliveryStatus,
  className = '',
  height = '580px',
  initialCenter = [28.5383, -81.3792],
  initialZoom = 13,
  showEmbedButton = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // User location state (Orlando Downtown / Parramore border)
  const [userLocation, setUserLocation] = useState<[number, number]>([28.5390, -81.3820]);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null); // miles
  const [activeFilter, setActiveFilter] = useState<'all' | 'food_desert_relief' | 'drop_offs' | 'drive_thru' | 'open_now' | 'no_id' | 'fridges'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVulnerabilityOverlay, setShowVulnerabilityOverlay] = useState(true);
  const [isHotMapActive, setIsHotMapActive] = useState(false);
  const [showDropOffs, setShowDropOffs] = useState(true);
  const [libreMapStyle, setLibreMapStyle] = useState<keyof typeof LIBRE_TILE_PROVIDERS>('voyager');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Selected Drop-off request & details
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);

  // Selected Zone info panel
  const [selectedZone, setSelectedZone] = useState<UnderprivilegedZone | null>(null);

  // Active Route info banner (works for both Pantries and Doorstep drop-offs)
  const [activeRouteInfo, setActiveRouteInfo] = useState<{
    destinationTitle: string;
    destinationAddress: string;
    distanceMiles: number;
    estDriveMinutes: number;
    isDelivery?: boolean;
    deliveryRequest?: DeliveryRequest;
    pantry?: Pantry;
  } | null>(null);

  // Embed Modal State
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedHeight, setEmbedHeight] = useState('580');
  const [copiedSnippet, setCopiedSnippet] = useState<'iframe' | 'react' | 'api' | null>(null);

  // Filtered Pantries
  const filteredPantries = useMemo(() => {
    if (activeFilter === 'drop_offs') return [];
    return pantries.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (activeFilter === 'food_desert_relief') {
        return (
          p.badges.includes('food_desert_relief') ||
          p.servesUnderprivilegedArea ||
          p.neighborhood.toLowerCase().includes('parramore') ||
          p.neighborhood.toLowerCase().includes('mercy') ||
          p.neighborhood.toLowerCase().includes('pine hills') ||
          p.neighborhood.toLowerCase().includes('obt') ||
          p.neighborhood.toLowerCase().includes('holden') ||
          p.neighborhood.toLowerCase().includes('azalea')
        );
      }
      if (activeFilter === 'drive_thru') return p.driveThruLaneActive;
      if (activeFilter === 'open_now') return p.openToday;
      if (activeFilter === 'no_id') return p.badges.includes('no_id');
      if (activeFilter === 'fridges') return false;
      return true;
    });
  }, [pantries, searchQuery, activeFilter]);

  // Filtered Deliveries / Drop-off points
  const filteredDeliveries = useMemo(() => {
    if (!showDropOffs && activeFilter !== 'drop_offs') return [];
    if (activeFilter === 'fridges') return [];
    return deliveries.filter((d) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          d.recipientName.toLowerCase().includes(q) ||
          d.neighborhood.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          d.boxType.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [deliveries, showDropOffs, activeFilter, searchQuery]);

  const showFridges = activeFilter === 'all' || activeFilter === 'fridges';

  // 1. Initialize LibreMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false
      });

      // LibreMap Tile Layer
      const provider = LIBRE_TILE_PROVIDERS[libreMapStyle];
      const tileLayer = L.tileLayer(provider.url, {
        attribution: provider.attribution,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      currentTileLayerRef.current = tileLayer;

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer groups
      const zonesLayer = L.layerGroup().addTo(map);
      zonesLayerRef.current = zonesLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer if user selects different Libre style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const provider = LIBRE_TILE_PROVIDERS[libreMapStyle];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    currentTileLayerRef.current = newTileLayer;
  }, [libreMapStyle]);

  // 2. Render Underprivileged / Food Insecurity Zones Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = zonesLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (!showVulnerabilityOverlay) return;

    vulnerabilityZones.forEach((zone) => {
      // Determine colors based on severity
      const isSevere = zone.designation.includes('Severe');
      const fillColor = isSevere ? '#DC2626' : '#D97706';
      const borderColor = isSevere ? '#991B1B' : '#B45309';

      // Standard Polygon
      const polygon = L.polygon(zone.boundaryPolygon, {
        color: borderColor,
        weight: 2,
        dashArray: '5, 5',
        fillColor: fillColor,
        fillOpacity: isHotMapActive ? 0.28 : 0.16
      });

      polygon.on('click', () => {
        setSelectedZone(zone);
        setSelectedDelivery(null);
        map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
      });

      // Hover effect
      polygon.on('mouseover', () => {
        polygon.setStyle({ fillOpacity: 0.35, weight: 3 });
      });
      polygon.on('mouseout', () => {
        polygon.setStyle({ fillOpacity: isHotMapActive ? 0.28 : 0.16, weight: 2 });
      });

      // Hot Map Thermal Circle Intensity Aura
      if (isHotMapActive) {
        const heatCircle = L.circle([zone.centerCoordinates.lat, zone.centerCoordinates.lng], {
          radius: isSevere ? 1600 : 1200,
          color: '#EA580C',
          weight: 2,
          fillColor: '#EF4444',
          fillOpacity: 0.22,
          dashArray: '4, 6'
        });
        layer.addLayer(heatCircle);
      }

      // Label Marker at the center of the underprivileged zone
      const labelHtml = `
        <div style="background: rgba(255, 255, 255, 0.95); border: 1.5px solid ${borderColor}; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; color: ${borderColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.2); white-space: nowrap; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          <span>${isHotMapActive ? '🔥' : '⚠️'}</span>
          <span>${zone.name.split('Food')[0].trim()}</span>
          <span style="background: ${fillColor}; color: white; padding: 1px 5px; border-radius: 9999px; font-size: 9px;">${zone.vulnerabilityScore}/100</span>
        </div>
      `;

      const labelMarker = L.marker([zone.centerCoordinates.lat, zone.centerCoordinates.lng], {
        icon: L.divIcon({
          html: labelHtml,
          className: 'custom-marker-icon',
          iconSize: [140, 24],
          iconAnchor: [70, 12]
        })
      });

      labelMarker.on('click', () => {
        setSelectedZone(zone);
        setSelectedDelivery(null);
        map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
      });

      layer.addLayer(polygon);
      layer.addLayer(labelMarker);
    });
  }, [vulnerabilityZones, showVulnerabilityOverlay, isHotMapActive]);

  // 3. Render Food Bank, Fridge & Drop-Off Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // A. User Location Marker
    if (userLocation) {
      const userIconHtml = `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background: #2563EB; border-radius: 9999px; opacity: 0.25; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; background: #2563EB; border: 2.5px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;
      const userMarker = L.marker(userLocation, {
        icon: L.divIcon({
          html: userIconHtml,
          className: 'custom-marker-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      });
      userMarker.bindTooltip('Your Location', { direction: 'top', offset: [0, -10] });
      layer.addLayer(userMarker);
    }

    // B. Food Bank & Pantry Markers
    filteredPantries.forEach((pantry) => {
      const hasDriveThru = pantry.driveThruLaneActive;
      const isOpen = pantry.openToday;
      const servesUnderprivileged = pantry.servesUnderprivilegedArea || pantry.badges.includes('food_desert_relief');
      const pinBg = isOpen ? '#1E5128' : '#64748B';

      const markerHtml = `
        <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
          ${
            servesUnderprivileged
              ? `<div style="background: #991B1B; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(153,27,27,0.4); white-space: nowrap; margin-bottom: 2px; border: 1.5px solid #FFFFFF; display: flex; align-items: center; gap: 3px;">
                  <span>★ Priority Relief Hub</span>
                </div>`
              : hasDriveThru
              ? `<div style="background: #1E5128; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(30,81,40,0.35); white-space: nowrap; margin-bottom: 2px; border: 1.5px solid #FFFFFF; display: flex; align-items: center; gap: 3px;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: #8CC38F;"></span>
                  <span>${pantry.queueCars} cars • ${pantry.queueWaitMinutes}m</span>
                </div>`
              : `<div style="background: #D97706; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(217,119,6,0.3); white-space: nowrap; margin-bottom: 2px; border: 1.5px solid #FFFFFF;">
                  Walk-Up Window
                </div>`
          }
          <div style="width: 40px; height: 40px; border-radius: 9999px; background: ${pinBg}; border: 3px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${pinBg}; margin-top: -2px;"></div>
        </div>
      `;

      const marker = L.marker([pantry.coordinates.lat, pantry.coordinates.lng], {
        icon: L.divIcon({
          html: markerHtml,
          className: 'custom-marker-icon',
          iconSize: [86, 72],
          iconAnchor: [43, 72]
        })
      });

      // Rich Interactive Popup
      const popupHtml = `
        <div style="width: 290px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="position: relative; height: 110px; width: 100%; overflow: hidden; background: #E8EFE9;">
            <img src="${pantry.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);"></div>
            <div style="position: absolute; bottom: 8px; left: 10px; right: 10px; color: white;">
              <span style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #8CC38F;">${pantry.organization}</span>
              <h4 style="font-size: 14px; font-weight: 800; line-height: 1.2; margin: 0; color: white;">${pantry.name}</h4>
            </div>
            <span style="position: absolute; top: 8px; left: 8px; background: ${isOpen ? '#15803D' : '#64748B'}; color: white; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
              ${isOpen ? 'Open Today' : 'Closed'}
            </span>
            ${
              servesUnderprivileged
                ? `<span style="position: absolute; top: 8px; right: 8px; background: #991B1B; color: white; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">
                    Underprivileged Area
                  </span>`
                : ''
            }
          </div>

          <div style="padding: 12px; background: #FFFFFF;">
            <p style="font-size: 12px; color: #414940; margin: 0 0 8px 0;">
              📍 <strong>${pantry.address}</strong> (${pantry.neighborhood})
            </p>

            ${
              hasDriveThru
                ? `<div style="background: #F4F7F4; border: 1px solid #CBD5E1; border-radius: 8px; padding: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #1E5128;">
                       🚗 Drive-Thru Queue
                      <span>~${pantry.queueWaitMinutes} mins</span>
                    </div>
                    <p style="font-size: 11px; color: #414940; margin: 2px 0 0 0;">
                      <strong>${pantry.queueCars} cars</strong> currently waiting • Contactless trunk drop
                    </p>
                  </div>`
                : ''
            }

            <div style="display: flex; gap: 6px; margin-top: 10px;">
              <button
                id="btn-route-${pantry.id}"
                style="flex: 1; min-height: 38px; background: #1E5128; color: white; border: none; border-radius: 9999px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
              >
                🧭 Draw Route Path
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 320 });

      marker.on('popupopen', () => {
        const routeBtn = document.getElementById(`btn-route-${pantry.id}`);
        if (routeBtn) {
          routeBtn.onclick = () => {
            handleDrawRoute(pantry);
            marker.closePopup();
          };
        }
      });

      layer.addLayer(marker);
    });

    // C. 24/7 Community Fridge Markers
    if (showFridges) {
      fridges.forEach((fridge) => {
        const fridgeHtml = `
          <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
            <div style="background: #92400E; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 2px; border: 1px solid white;">
              24/7 Free Fridge
            </div>
            <div style="width: 34px; height: 34px; border-radius: 9999px; background: #D97706; border: 2.5px solid #FFFFFF; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
              <span style="font-size: 16px;">🧊</span>
            </div>
          </div>
        `;

        const fridgeMarker = L.marker([fridge.coordinates.lat, fridge.coordinates.lng], {
          icon: L.divIcon({
            html: fridgeHtml,
            className: 'custom-marker-icon',
            iconSize: [70, 56],
            iconAnchor: [35, 56]
          })
        });

        const fridgePopup = `
          <div style="padding: 12px; width: 240px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <span style="background: #FEF3C7; color: #92400E; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">
              24/7 Mutual Aid
            </span>
            <h4 style="font-size: 14px; font-weight: 800; margin: 6px 0 2px 0; color: #111C2D;">${fridge.name}</h4>
            <p style="font-size: 11px; color: #414940; margin: 0 0 6px 0;">📍 ${fridge.location}</p>
            <p style="font-size: 11px; color: #15803D; margin: 0; font-weight: 600;">✨ ${fridge.rule}</p>
          </div>
        `;

        fridgeMarker.bindPopup(fridgePopup);
        layer.addLayer(fridgeMarker);
      });
    }

    // D. Drop-Off Point Markers (Neighbor Doorstep Food Box Requests)
    if (showDropOffs || activeFilter === 'drop_offs') {
      filteredDeliveries.forEach((delivery, index) => {
        const coords = getOrlandoDropCoords(delivery, index);
        const isPending = delivery.status === 'pending';
        const isInTransit = delivery.status === 'in_transit';
        const isDelivered = delivery.status === 'delivered';
        const isUrgent = delivery.urgency === 'urgent_today';

        const pinColor = isDelivered ? '#16A34A' : isInTransit ? '#0284C7' : isPending ? '#D97706' : '#2563EB';
        const statusLabel = isDelivered ? 'Delivered' : isInTransit ? 'En Route' : isPending ? 'Needs Drop' : 'Assigned';

        const dropPinHtml = `
          <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center; z-index: 1000;">
            <div style="background: ${pinColor}; color: #FFFFFF; font-size: 9.5px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap; margin-bottom: 2px; border: 1.5px solid #FFFFFF; display: flex; align-items: center; gap: 3px;">
              <span>📦</span>
              <span>${delivery.recipientName.split(' ')[0]} • ${statusLabel}</span>
              ${isUrgent ? '<span style="background: #991B1B; padding: 0 4px; border-radius: 4px; font-size: 8px;">!</span>' : ''}
            </div>
            <div style="width: 36px; height: 36px; border-radius: 12px; background: ${pinColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
              ${
                isDelivered
                  ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                  : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>'
              }
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${pinColor}; margin-top: -2px;"></div>
            ${isPending ? '<div style="position: absolute; bottom: 0; width: 44px; height: 44px; border-radius: 9999px; border: 2px solid #D97706; opacity: 0.6; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>' : ''}
          </div>
        `;

        const dropMarker = L.marker(coords, {
          icon: L.divIcon({
            html: dropPinHtml,
            className: 'custom-marker-icon',
            iconSize: [80, 64],
            iconAnchor: [40, 64]
          })
        });

        dropMarker.bindTooltip(`Drop-off: ${delivery.recipientName} • ${BOX_TYPE_INFO[delivery.boxType]?.label || delivery.boxType}`, {
          direction: 'top',
          offset: [0, -10]
        });

        dropMarker.on('click', () => {
          setSelectedDelivery(delivery);
          setSelectedZone(null);
          map.setView(coords, Math.max(map.getZoom(), 14));
        });

        layer.addLayer(dropMarker);
      });
    }
  }, [filteredPantries, fridges, filteredDeliveries, showFridges, showDropOffs, userLocation]);

  // 4. Draw Route Path Polyline to Food Pantry
  const handleDrawRoute = (pantry: Pantry) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    const start: [number, number] = userLocation;
    const dest: [number, number] = [pantry.coordinates.lat, pantry.coordinates.lng];

    const midPoint: [number, number] = [
      start[0] + (dest[0] - start[0]) * 0.5,
      start[1] + (dest[1] - start[1]) * 0.2
    ];
    const secondMid: [number, number] = [
      dest[0],
      start[1] + (dest[1] - start[1]) * 0.7
    ];

    const routeCoords = [start, midPoint, secondMid, dest];

    const polyline = L.polyline(routeCoords, {
      color: '#1E5128',
      weight: 5,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    routeLayerRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Distance & drive time
    const R = 3958.8; // miles
    const dLat = ((dest[0] - start[0]) * Math.PI) / 180;
    const dLng = ((dest[1] - start[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start[0] * Math.PI) / 180) *
        Math.cos((dest[0] * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = parseFloat((R * c).toFixed(1));
    const estMinutes = Math.max(3, Math.round(dist * 3.5));

    setActiveRouteInfo({
      destinationTitle: pantry.name,
      destinationAddress: pantry.address,
      distanceMiles: dist,
      estDriveMinutes: estMinutes,
      pantry
    });
  };

  // 4b. Draw Route Path Polyline to Doorstep Drop-off
  const handleDrawDeliveryRoute = (delivery: DeliveryRequest) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    const start: [number, number] = userLocation;
    const dest = getOrlandoDropCoords(delivery);

    const midPoint: [number, number] = [
      start[0] + (dest[0] - start[0]) * 0.5,
      start[1] + (dest[1] - start[1]) * 0.2
    ];
    const secondMid: [number, number] = [
      dest[0],
      start[1] + (dest[1] - start[1]) * 0.7
    ];

    const routeCoords = [start, midPoint, secondMid, dest];

    const polyline = L.polyline(routeCoords, {
      color: '#2563EB',
      weight: 5,
      dashArray: '8, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    routeLayerRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [60, 60] });

    // Distance & drive time
    const R = 3958.8; // miles
    const dLat = ((dest[0] - start[0]) * Math.PI) / 180;
    const dLng = ((dest[1] - start[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start[0] * Math.PI) / 180) *
        Math.cos((dest[0] * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = parseFloat((R * c).toFixed(1));
    const estMinutes = Math.max(2, Math.round(dist * 3.5));

    setActiveRouteInfo({
      destinationTitle: `Doorstep: ${delivery.recipientName}`,
      destinationAddress: delivery.address,
      distanceMiles: dist,
      estDriveMinutes: estMinutes,
      isDelivery: true,
      deliveryRequest: delivery
    });
  };

  // 5. Geolocation Locate Me
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView(coords, 14);
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // 6. Radius Circle Toggle
  const handleRadiusChange = (miles: number | null) => {
    setSelectedRadius(miles);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (miles && userLocation) {
      const radiusMeters = miles * 1609.34;
      const circle = L.circle(userLocation, {
        radius: radiusMeters,
        color: '#1E5128',
        weight: 1.5,
        fillColor: '#1E5128',
        fillOpacity: 0.08,
        dashArray: '4, 4'
      }).addTo(map);

      radiusCircleRef.current = circle;
      map.fitBounds(circle.getBounds(), { padding: [20, 20] });
    }
  };

  // Embed Snippet Generator
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nourish-together.app';
  const iframeSnippet = `<iframe
  src="${currentAppUrl}?view=map_embed&filter=${activeFilter}&vulnerability=${showVulnerabilityOverlay ? '1' : '0'}"
  width="100%"
  height="${embedHeight}px"
  style="border: 1px solid #1E5128; border-radius: 16px; overflow: hidden;"
  title="NourishTogether LibreMap - Underprivileged Areas & Food Banks"
  allow="geolocation"
  loading="lazy"
></iframe>`;

  const reactSnippet = `import { NourishLibreMap } from '@nourish/libre-map';

export default function FoodSecurityMap() {
  return (
    <NourishLibreMap
      apiEndpoint="${currentAppUrl}/api/pantries"
      vulnerabilityApi="${currentAppUrl}/api/vulnerability-zones"
      showFoodDeserts={true}
      libreStyle="voyager"
      height="${embedHeight}px"
    />
  );
}`;

  const copyToClipboard = (text: string, type: 'iframe' | 'react' | 'api') => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(type);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border border-[#1E5128]/20 shadow-md overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Map Control Bar */}
      <div className="bg-[#FFFFFF] border-b border-[#CBD5E1] p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2.5 z-20">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or neighborhood..."
            className="w-full text-xs py-2 pl-8 pr-3 rounded-full border border-[#CBD5E1] bg-[#F4F7F4] focus:ring-2 focus:ring-[#1E5128] focus:outline-hidden"
          />
          <MapPin className="w-3.5 h-3.5 text-[#71796F] absolute left-2.5 top-2.5" />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-[#1E5128] text-white'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            All Sites ({pantries.length})
          </button>

          {/* Underprivileged Areas / Food Deserts Filter */}
          <button
            onClick={() => setActiveFilter('food_desert_relief')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'food_desert_relief'
                ? 'bg-[#991B1B] text-white shadow-xs'
                : 'bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FCA5A5]'
            }`}
          >
            <span>★ Foodbanks in Underprivileged Areas</span>
          </button>

          <button
            onClick={() => setActiveFilter('drive_thru')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'drive_thru'
                ? 'bg-[#1E5128] text-white'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            🚗 Drive-Thru
          </button>

          <button
            onClick={() => setActiveFilter('open_now')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'open_now'
                ? 'bg-[#15803D] text-white'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            Open Now
          </button>

          <button
            onClick={() => setActiveFilter('fridges')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'fridges'
                ? 'bg-[#D97706] text-white'
                : 'bg-[#F4F7F4] text-[#414940] hover:bg-[#E8EFE9]'
            }`}
          >
            🧊 24/7 Fridges ({fridges.length})
          </button>

          {/* Doorstep Drop-offs Filter */}
          <button
            onClick={() => setActiveFilter(activeFilter === 'drop_offs' ? 'all' : 'drop_offs')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'drop_offs'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
            }`}
          >
            <span>📦 Doorstep Drop-offs ({deliveries.length})</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Hot Map (Humanitarian OSM Tiles + Heat Aura) */}
          <button
            onClick={() => {
              const nextVal = !isHotMapActive;
              setIsHotMapActive(nextVal);
              if (nextVal) {
                setLibreMapStyle('humanitarian');
                setShowVulnerabilityOverlay(true);
              }
            }}
            title="Toggle Hot Map (Humanitarian OpenStreetMap tiles & high-need heat density)"
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isHotMapActive
                ? 'bg-gradient-to-r from-[#DC2626] to-[#EA580C] text-white border-transparent shadow-sm'
                : 'bg-white text-[#DC2626] border-[#DC2626]/40 hover:bg-[#FEF2F2]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isHotMapActive ? 'animate-bounce text-yellow-300' : 'text-[#DC2626]'}`} />
            <span>Hot Map (HOT)</span>
            {isHotMapActive && (
              <span className="text-[9px] bg-black/20 px-1 py-0.5 rounded font-black tracking-wider">
                ACTIVE
              </span>
            )}
          </button>

          {/* Underprivileged Food Deserts Overlay Toggle */}
          <button
            onClick={() => setShowVulnerabilityOverlay(!showVulnerabilityOverlay)}
            title="Toggle Underprivileged / Food Insecurity Area Polygons"
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              showVulnerabilityOverlay
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#D97706]/30'
                : 'bg-white text-[#71796F] border-[#CBD5E1]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden md:inline">Food Desert Zones</span>
          </button>

          {/* LibreMaps Style Menu */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              title="LibreMaps Style Switcher"
              className="p-1.5 rounded-full border border-[#CBD5E1] bg-white text-[#414940] hover:bg-[#F4F7F4] cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-[#CBD5E1] p-2 z-50 text-xs">
                <span className="text-[10px] font-bold text-[#71796F] uppercase tracking-wider block px-2 py-1">
                  LibreMap Providers:
                </span>
                {(Object.keys(LIBRE_TILE_PROVIDERS) as (keyof typeof LIBRE_TILE_PROVIDERS)[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setLibreMapStyle(key);
                      setShowLayerMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold flex items-center justify-between cursor-pointer ${
                      libreMapStyle === key
                        ? 'bg-[#E8EFE9] text-[#1E5128]'
                        : 'hover:bg-[#F4F7F4] text-[#1E293B]'
                    }`}
                  >
                    <span>{LIBRE_TILE_PROVIDERS[key].name}</span>
                    {libreMapStyle === key && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Locate Button */}
          <button
            onClick={handleLocateMe}
            title="Locate my position"
            className="w-8 h-8 rounded-full border border-[#CBD5E1] bg-white hover:bg-[#F4F7F4] text-[#1E5128] flex items-center justify-center cursor-pointer transition-colors"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>

          {/* Plug & Play Embed Button */}
          {showEmbedButton && (
            <button
              onClick={() => setShowEmbedModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#E8EFE9] text-[#1E5128] hover:bg-[#1E5128] hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer border border-[#1E5128]/20"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Plug & Play</span> Embed
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen Map'}
            className="w-8 h-8 rounded-full border border-[#CBD5E1] bg-white hover:bg-[#F4F7F4] text-[#414940] flex items-center justify-center cursor-pointer transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Legend Banner for LibreMaps & Underprivileged Tracts */}
      <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-4 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2 text-[#414940] z-20">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1E293B]">LibreMap Layers:</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#1E5128] inline-block border border-white" />
            <span>Food Bank</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-[#991B1B] inline-block border border-white" />
            <span>Priority Relief Hub</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-md bg-[#DC2626]/20 border border-[#DC2626] inline-block" />
            <span>Underprivileged Zone</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] inline-flex items-center justify-center text-[8px] text-white font-bold border border-white shadow-xs">
              📦
            </span>
            <span className="font-semibold text-[#1D4ED8]">Drop-off Points ({deliveries.length})</span>
          </span>
          {isHotMapActive && (
            <span className="flex items-center gap-1 text-[#DC2626] font-bold animate-pulse">
              <Flame className="w-3 h-3 text-[#EA580C]" />
              <span>Humanitarian HOT Thermal Layer</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#71796F]">
          <span>OpenStreetMap Libre Data</span>
          <span>•</span>
          <span>USDA Food Access Atlas</span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full flex-1 z-10" />

      {/* Underprivileged Zone Detailed Profile Drawer (Bottom Sheet) */}
      {selectedZone && (
        <div className="absolute top-16 right-4 sm:right-6 w-full max-w-sm z-30 bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-[#D97706] animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="bg-[#FEE2E2] text-[#991B1B] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block">
                {selectedZone.designation}
              </span>
              <h4 className="text-base font-extrabold text-[#111C2D] mt-1 leading-snug">
                {selectedZone.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-xs text-[#71796F] hover:text-[#111C2D] font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-[#414940] mb-3 leading-relaxed">
            {selectedZone.description}
          </p>

          {/* Key Demographic Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#CBD5E1]">
              <span className="text-[10px] font-bold text-[#71796F]">HUNGER VULNERABILITY:</span>
              <p className="text-base font-black text-[#B91C1C]">{selectedZone.vulnerabilityScore} / 100</p>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#CBD5E1]">
              <span className="text-[10px] font-bold text-[#71796F]">POVERTY RATE:</span>
              <p className="text-base font-black text-[#111C2D]">{selectedZone.povertyRate}</p>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#CBD5E1]">
              <span className="text-[10px] font-bold text-[#71796F]">SNAP/EBT PARTICIPATION:</span>
              <p className="text-base font-black text-[#1E5128]">{selectedZone.snapParticipationRate}</p>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-xl border border-[#CBD5E1]">
              <span className="text-[10px] font-bold text-[#71796F]">ZERO-VEHICLE FAMILIES:</span>
              <p className="text-base font-black text-[#D97706]">{selectedZone.zeroVehicleHouseholds}</p>
            </div>
          </div>

          {/* Key Challenges */}
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71796F] block mb-1">
              Food Access Barriers:
            </span>
            <ul className="text-[11px] text-[#414940] space-y-0.5 list-disc list-inside">
              {selectedZone.keyChallenges.map((ch, i) => (
                <li key={i}>{ch}</li>
              ))}
            </ul>
          </div>

          {/* Serving Food Banks in this Area */}
          <div className="pt-2 border-t border-[#F1F5F9]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5128] block mb-1.5">
              Food Banks Operating Here:
            </span>
            <div className="space-y-1.5">
              {pantries
                .filter((p) => selectedZone.servingPantryIds.includes(p.id))
                .map((servingPantry) => (
                  <div
                    key={servingPantry.id}
                    className="p-2 rounded-xl bg-[#F4F7F4] border border-[#CBD5E1] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#111C2D]">{servingPantry.name}</p>
                      <p className="text-[11px] text-[#15803D]">
                        🚗 Queue: {servingPantry.queueCars} cars (~{servingPantry.queueWaitMinutes}m)
                      </p>
                    </div>
                    {onSelectPantry && (
                      <button
                        onClick={() => {
                          onSelectPantry(servingPantry);
                          setSelectedZone(null);
                        }}
                        className="px-3 py-1 rounded-full bg-[#1E5128] text-white text-[11px] font-bold hover:bg-[#14381B] cursor-pointer"
                      >
                        Details
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Drop-Off Request Card (What they requested, status, address, directions, driver dispatch) */}
      {selectedDelivery && (
        <div className="absolute top-16 right-4 sm:right-6 w-full max-w-sm z-30 bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-[#2563EB] animate-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-lg shrink-0">
                📦
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#3730A3]">
                    {selectedDelivery.neighborhood}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      selectedDelivery.status === 'delivered'
                        ? 'bg-[#DCFCE7] text-[#15803D]'
                        : selectedDelivery.status === 'in_transit'
                        ? 'bg-[#F3E8FF] text-[#7E22CE]'
                        : selectedDelivery.status === 'assigned'
                        ? 'bg-[#DBEAFE] text-[#1D4ED8]'
                        : 'bg-[#FEF3C7] text-[#B45309]'
                    }`}
                  >
                    {selectedDelivery.status === 'delivered'
                      ? '✓ Delivered'
                      : selectedDelivery.status === 'in_transit'
                      ? '🚚 In Transit'
                      : selectedDelivery.status === 'assigned'
                      ? '👤 Driver Assigned'
                      : '⏳ Pending Dispatch'}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#111C2D] mt-0.5 leading-snug">
                  {selectedDelivery.recipientName}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setSelectedDelivery(null)}
              className="text-xs text-[#71796F] hover:text-[#111C2D] font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Requested Box Card / Details */}
          <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                Requested Box Package:
              </span>
              <span className="text-xs font-black text-[#15803D]">
                {BOX_TYPE_INFO[selectedDelivery.boxType]?.title || selectedDelivery.boxType}
              </span>
            </div>
            <p className="text-[11px] text-[#166534]/90 leading-relaxed">
              {BOX_TYPE_INFO[selectedDelivery.boxType]?.description || 'Custom wholesome grocery box with pantry staples.'}
            </p>
          </div>

          {/* Household & Delivery Window */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#64748B] block">HOUSEHOLD SIZE:</span>
              <p className="font-bold text-[#1E293B] mt-0.5">{selectedDelivery.householdSize} Persons</p>
            </div>
            <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]">
              <span className="text-[10px] font-bold text-[#64748B] block">PREFERRED WINDOW:</span>
              <p className="font-bold text-[#1E293B] mt-0.5 truncate">{selectedDelivery.preferredWindow || 'Next Delivery'}</p>
            </div>
          </div>

          {/* Dietary Restrictions */}
          {selectedDelivery.dietaryRestrictions && selectedDelivery.dietaryRestrictions.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                Dietary Needs:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedDelivery.dietaryRestrictions.map((diet, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-md border border-[#FDE68A]"
                  >
                    {diet}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Address & Safe Drop Notes */}
          <div className="mb-3 bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] text-xs">
            <div className="flex items-start gap-1.5 text-[#334155] mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#0F172A]">{selectedDelivery.address}</p>
                <p className="text-[10px] text-[#64748B]">{selectedDelivery.neighborhood}, Orlando FL</p>
              </div>
            </div>
            {selectedDelivery.notes && (
              <div className="mt-1.5 pt-1.5 border-t border-[#E2E8F0] text-[11px] text-[#475569]">
                <span className="font-bold text-[#1E293B]">Drop instructions: </span>
                <span className="italic">"{selectedDelivery.notes}"</span>
              </div>
            )}
          </div>

          {/* Action Buttons: Route polyline + Driver status toggle */}
          <div className="space-y-2 pt-1 border-t border-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDrawDeliveryRoute(selectedDelivery)}
                className="flex-1 py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Draw Doorstep Route</span>
              </button>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedDelivery.address}, ${selectedDelivery.neighborhood}, Orlando, FL`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] rounded-xl text-[#334155] flex items-center justify-center"
                title="Open in Phone GPS"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Volunteer Driver Workflow Action */}
            {onUpdateDeliveryStatus && (
              <div className="flex items-center gap-1.5">
                {selectedDelivery.status === 'pending' && (
                  <button
                    onClick={() => {
                      onUpdateDeliveryStatus(selectedDelivery.id, 'assigned');
                      setSelectedDelivery({ ...selectedDelivery, status: 'assigned' });
                    }}
                    className="w-full py-1.5 px-3 bg-[#1E5128] hover:bg-[#163E1F] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    🙋 Accept & Claim as Volunteer Driver
                  </button>
                )}
                {selectedDelivery.status === 'assigned' && (
                  <button
                    onClick={() => {
                      onUpdateDeliveryStatus(selectedDelivery.id, 'in_transit');
                      setSelectedDelivery({ ...selectedDelivery, status: 'in_transit' });
                    }}
                    className="w-full py-1.5 px-3 bg-[#7E22CE] hover:bg-[#6B21A8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    🚚 Start Delivery Run (In Transit)
                  </button>
                )}
                {selectedDelivery.status === 'in_transit' && (
                  <button
                    onClick={() => {
                      onUpdateDeliveryStatus(selectedDelivery.id, 'delivered');
                      setSelectedDelivery({ ...selectedDelivery, status: 'delivered' });
                    }}
                    className="w-full py-1.5 px-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    ✓ Confirm Doorstep Drop-off Complete
                  </button>
                )}
                {selectedDelivery.status === 'delivered' && (
                  <div className="w-full text-center py-1.5 text-xs text-[#15803D] font-bold bg-[#DCFCE7] rounded-xl border border-[#86EFAC]">
                    ✓ Successfully Delivered to Doorstep
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Route Bottom Guidance Banner */}
      {activeRouteInfo && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-30 bg-white rounded-2xl p-4 shadow-xl border-2 border-[#1E5128] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#1E5128] text-white flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5 text-[#8CC38F]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E5128]">
                  {activeRouteInfo.isDelivery ? 'Doorstep Delivery Route' : 'Drive-Thru Pantry Route'}
                </span>
                <h4 className="font-extrabold text-sm text-[#111C2D] leading-tight">
                  {activeRouteInfo.destinationTitle}
                </h4>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveRouteInfo(null);
                if (routeLayerRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(routeLayerRef.current);
                }
              }}
              className="text-xs text-[#71796F] hover:text-[#111C2D] font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
            <div className="bg-[#F4F7F4] p-2 rounded-lg">
              <span className="text-[#71796F] text-[10px]">DISTANCE:</span>
              <p className="font-bold text-[#111C2D]">{activeRouteInfo.distanceMiles} miles</p>
            </div>
            <div className="bg-[#F4F7F4] p-2 rounded-lg">
              <span className="text-[#71796F] text-[10px]">EST. DRIVE TIME:</span>
              <p className="font-bold text-[#15803D]">~{activeRouteInfo.estDriveMinutes} mins</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(activeRouteInfo.destinationAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[38px] bg-[#1E5128] hover:bg-[#14381B] text-white font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Phone GPS</span>
            </a>

            {!activeRouteInfo.isDelivery && activeRouteInfo.pantry && onSelectPantry && (
              <button
                onClick={() => onSelectPantry(activeRouteInfo.pantry!)}
                className="px-3.5 min-h-[38px] border border-[#1E5128] text-[#1E5128] hover:bg-[#E8EFE9] font-bold text-xs rounded-full cursor-pointer"
              >
                Full Details
              </button>
            )}

            {activeRouteInfo.isDelivery && activeRouteInfo.deliveryRequest && (
              <button
                onClick={() => setSelectedDelivery(activeRouteInfo.deliveryRequest!)}
                className="px-3.5 min-h-[38px] border border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] font-bold text-xs rounded-full cursor-pointer"
              >
                Drop Details
              </button>
            )}
          </div>
        </div>
      )}

      {/* Plug & Play Embed Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B]/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#1E5128]/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#1E5128] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#8CC38F]" />
                <div>
                  <h3 className="font-bold text-base">Plug & Play LibreMap Widget</h3>
                  <p className="text-xs text-[#8CC38F]">
                    Embed live food pantries, food deserts & 24/7 mutual aid fridges into any website
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="bg-[#F4F7F4] p-3.5 rounded-xl border border-[#CBD5E1] text-xs text-[#414940] flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#D97706] shrink-0" />
                <span>
                  <strong>LibreMaps 100% Free & Open:</strong> OpenStreetMap data powered with USDA Food Insecurity layers. Zero API keys, zero rate-limits.
                </span>
              </div>

              {/* Option 1: HTML iFrame Embed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#111C2D] uppercase tracking-wider">
                    Option 1: Drop-In HTML IFrame:
                  </label>
                  <button
                    onClick={() => copyToClipboard(iframeSnippet, 'iframe')}
                    className="text-xs text-[#1E5128] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedSnippet === 'iframe' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#1E293B] text-slate-200 text-xs rounded-xl overflow-x-auto font-mono">
                  {iframeSnippet}
                </pre>
              </div>

              {/* Option 2: React Component */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#111C2D] uppercase tracking-wider">
                    Option 2: React Component Integration:
                  </label>
                  <button
                    onClick={() => copyToClipboard(reactSnippet, 'react')}
                    className="text-xs text-[#1E5128] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedSnippet === 'react' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#1E293B] text-slate-200 text-xs rounded-xl overflow-x-auto font-mono">
                  {reactSnippet}
                </pre>
              </div>

              {/* Option 3: REST API Feed Link */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#111C2D] uppercase tracking-wider">
                    Option 3: Real-Time REST API Feed:
                  </label>
                  <button
                    onClick={() => copyToClipboard(`${currentAppUrl}/api/vulnerability-zones`, 'api')}
                    className="text-xs text-[#1E5128] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedSnippet === 'api' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Copied URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Endpoint</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono text-[#1E293B] flex items-center justify-between">
                  <span>GET {currentAppUrl}/api/vulnerability-zones</span>
                  <a
                    href="/api/vulnerability-zones"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <span>Test JSON</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#F4F7F4] border-t border-[#CBD5E1] flex justify-end">
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#1E5128] text-white font-bold text-xs hover:bg-[#14381B] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
