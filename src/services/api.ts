import { Pantry, DeliveryRequest, VolunteerShift, BadgeType } from '../types';

export interface CommunityFridge {
  id: string;
  name: string;
  location: string;
  city: string;
  coordinates: { lat: number; lng: number };
  access: string;
  stock: string;
  rule: string;
  status: 'stocked_now' | 'needs_restock';
}

export interface SnapEstimateResult {
  householdSize: number;
  estimatedSnapMonthly: number;
  wicMonthly: number;
  doubleUpBucks: number;
  totalMonthlyFoodAssistance: number;
  maxPossibleAllotment: number;
  breakdown: {
    standardDeduction: number;
    earnedDeduction: number;
    shelterDeduction: number;
    netIncome: number;
  };
}

export const api = {
  // Fetch Pantries with optional geographic and badge filters
  async getPantries(params?: {
    search?: string;
    badge?: BadgeType | 'all' | string;
    open_now?: boolean;
    lat?: number;
    lng?: number;
    radius_miles?: number;
  }): Promise<Pantry[]> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.badge && params.badge !== 'all') query.set('badge', params.badge);
      if (params?.open_now) query.set('open_now', 'true');
      if (params?.lat !== undefined) query.set('lat', params.lat.toString());
      if (params?.lng !== undefined) query.set('lng', params.lng.toString());
      if (params?.radius_miles) query.set('radius_miles', params.radius_miles.toString());

      const res = await fetch(`/api/pantries?${query.toString()}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('API error fetching pantries, using fallback:', err);
      return [];
    }
  },

  // Update real-time queue
  async updateQueue(
    pantryId: string,
    queueCars: number,
    queueWaitMinutes: number,
    queueTrend: 'speeding_up' | 'stable' | 'slowing_down'
  ): Promise<Pantry | null> {
    try {
      const res = await fetch(`/api/pantries/${pantryId}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueCars, queueWaitMinutes, queueTrend })
      });
      if (!res.ok) throw new Error('Failed to update queue');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error('Error updating queue:', err);
      return null;
    }
  },

  // Toggle inventory item
  async toggleInventory(pantryId: string, itemId: string, inStock?: boolean): Promise<Pantry | null> {
    try {
      const res = await fetch(`/api/pantries/${pantryId}/inventory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, inStock })
      });
      if (!res.ok) throw new Error('Failed to toggle inventory');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error('Error toggling inventory:', err);
      return null;
    }
  },

  // Fetch 24/7 Community Fridges
  async getFridges(): Promise<CommunityFridge[]> {
    try {
      const res = await fetch('/api/fridges');
      if (!res.ok) throw new Error('Failed to fetch fridges');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('Error fetching fridges:', err);
      return [];
    }
  },

  // Fetch Underprivileged & Food Insecurity Zones
  async getVulnerabilityZones(): Promise<import('../types').UnderprivilegedZone[]> {
    try {
      const res = await fetch('/api/vulnerability-zones');
      if (!res.ok) throw new Error('Failed to fetch vulnerability zones');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('Error fetching vulnerability zones:', err);
      return [];
    }
  },

  // Deliveries API
  async getDeliveries(status?: string, driver?: string): Promise<DeliveryRequest[]> {
    try {
      const query = new URLSearchParams();
      if (status) query.set('status', status);
      if (driver) query.set('driver', driver);
      const res = await fetch(`/api/deliveries?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch deliveries');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('Error fetching deliveries:', err);
      return [];
    }
  },

  async createDelivery(payload: Partial<DeliveryRequest>): Promise<DeliveryRequest | null> {
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create delivery');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error('Error creating delivery:', err);
      return null;
    }
  },

  async updateDelivery(id: string, payload: Partial<DeliveryRequest>): Promise<DeliveryRequest | null> {
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update delivery');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error('Error updating delivery:', err);
      return null;
    }
  },

  // Shifts API
  async getShifts(): Promise<VolunteerShift[]> {
    try {
      const res = await fetch('/api/shifts');
      if (!res.ok) throw new Error('Failed to fetch shifts');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.warn('Error fetching shifts:', err);
      return [];
    }
  },

  async claimShift(shiftId: string): Promise<VolunteerShift | null> {
    try {
      const res = await fetch(`/api/shifts/${shiftId}/claim`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to claim shift');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error('Error claiming shift:', err);
      return null;
    }
  },

  // Accurate USDA SNAP Estimate API
  async estimateSnap(payload: {
    householdSize: number;
    monthlyIncome: number;
    rentMortgage: number;
    childcareOrMedical: number;
    hasChildrenUnder5: boolean;
    hasSeniorsOrDisabled: boolean;
  }): Promise<SnapEstimateResult | null> {
    try {
      const res = await fetch('/api/snap/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to calculate estimate');
      const data = await res.json();
      return data.data;
    } catch (err) {
      console.error('Error estimating SNAP:', err);
      return null;
    }
  }
};
