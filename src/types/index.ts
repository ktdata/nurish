export type BadgeType =
  | 'drive_thru'
  | 'no_id'
  | 'delivery'
  | 'shift_open'
  | 'hot_meals'
  | 'halal_kosher'
  | 'fresh_produce'
  | 'food_desert_relief';

export interface PantryInventory {
  id: string;
  name: string;
  category: 'produce' | 'dairy' | 'protein' | 'staples' | 'baby' | 'prepared';
  inStock: boolean;
  notes?: string;
}

export interface Pantry {
  id: string;
  name: string;
  organization: string;
  address: string;
  neighborhood: string;
  distanceMiles: number;
  openToday: boolean;
  hoursToday: string;
  scheduleDescription: string;
  phone: string;
  queueCars: number;
  queueWaitMinutes: number;
  queueTrend: 'speeding_up' | 'stable' | 'slowing_down';
  lastQueueUpdate: string;
  badges: BadgeType[];
  inventory: PantryInventory[];
  driveThruLaneActive: boolean;
  walkUpLaneActive: boolean;
  imageUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  notes: string;
  languagesSpoken: string[];
  servesUnderprivilegedArea?: boolean;
  vulnerabilityPriority?: 'high' | 'urgent' | 'moderate';
}

export interface UnderprivilegedZone {
  id: string;
  name: string;
  designation: 'Severe Food Desert' | 'High Need / Low Access' | 'Moderate Need';
  vulnerabilityScore: number; // 0 - 100
  povertyRate: string;
  snapParticipationRate: string;
  zeroVehicleHouseholds: string;
  avgSupermarketDistanceMiles: number;
  description: string;
  centerCoordinates: { lat: number; lng: number };
  boundaryPolygon: [number, number][]; // LatLng coordinates defining the geographic perimeter
  servingPantryIds: string[];
  keyChallenges: string[];
}

export interface DeliveryRequest {
  id: string;
  recipientName: string;
  phone: string;
  address: string;
  neighborhood: string;
  householdSize: number;
  boxType: 'family_bounty' | 'senior_wellness' | 'diabetic_care' | 'halal_staples' | 'baby_essentials';
  dietaryRestrictions: string[];
  safeDropNotes: string;
  urgency: 'routine' | 'urgent_today';
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered';
  assignedDriverId?: string;
  assignedDriverName?: string;
  requestedAt: string;
  deliveryWindow: string;
  proofPhotoUrl?: string;
  deliveredAt?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface VolunteerShift {
  id: string;
  pantryId: string;
  pantryName: string;
  role: 'drive_thru_director' | 'box_packer' | 'delivery_driver' | 'food_rescue_driver';
  title: string;
  date: string;
  timeSlot: string;
  spotsTotal: number;
  spotsClaimed: number;
  location: string;
  isUrgent: boolean;
  requirements: string[];
  claimedByCurrentUser?: boolean;
}

export type AppMode = 'neighbors' | 'volunteers';
export type NeighborTab = 'pantries' | 'snap_screener' | 'delivery_request' | 'resources';
export type VolunteerTab = 'active_deliveries' | 'shift_board' | 'pantry_hub';
export type Language = 'en' | 'es' | 'vi' | 'zh' | 'ar';
