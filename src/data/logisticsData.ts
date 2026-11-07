export interface ServiceZone {
  id: string;
  name: string;
  code: string;
  priorityIndex: string; // e.g. "PRIORITY 01"
  status: 'high_demand' | 'active_reserved' | 'supplied' | 'disbursed';
  urgencyLevel: 'URGENT NEED' | 'ACTIVE DISPATCH' | 'STABLE' | 'COMPLETED';
  coordinates: {
    lat: number;
    lng: number;
    gridRef: string; // e.g. "37.7749° N, 122.4194° W [SEC-4B]"
  };
  address: string;
  neighborhood: string;
  targetMeals: number;
  mealsServed: number;
  timeWindow: string; // e.g. "11:30 - 13:45"
  temperature: string; // e.g. "68°F Clear"
  assignedTruckId?: string;
  assignedDriver?: string;
  contactLead: string;
  specialInstructions: string;
  mealType: 'Hot Nutritional Stews' | 'Balanced Protein Boxes' | 'Fresh Produce & Soups' | 'Family Rations';
  pickupDepot: {
    id: string;
    name: string;
    code: string;
    address: string;
    window: string;
    itemsReady: { id: string; name: string; quantity: number; unit: string; checked: boolean }[];
  };
}

export interface OperationalWorkflowState {
  currentStep: 1 | 2 | 3; // 1: Reserve Spot -> 2: Pick Up Supplies -> 3: Serve Meals
  reservedZoneId: string | null;
  truckId: string;
  driverName: string;
  step1CompletedAt?: string;
  step2CompletedAt?: string;
  step3CompletedAt?: string;
  supplyManifest: {
    id: string;
    item: string;
    quantity: number;
    unit: string;
    verified: boolean;
    batchLot: string;
  }[];
}

export const INITIAL_SERVICE_ZONES: ServiceZone[] = [
  {
    id: 'zone-01',
    name: 'Tenderloin Community Center Plaza',
    code: 'SF-TL-04',
    priorityIndex: 'PRIORITY 01',
    status: 'high_demand',
    urgencyLevel: 'URGENT NEED',
    coordinates: {
      lat: 37.7842,
      lng: -122.4162,
      gridRef: '37.7842° N, 122.4162° W [SEC-TL-04]',
    },
    address: '201 Turk St (at Jones)',
    neighborhood: 'Tenderloin Hub',
    targetMeals: 450,
    mealsServed: 0,
    timeWindow: '11:00 - 13:30',
    temperature: '62°F Daylight High',
    contactLead: 'M. Chen (On-site Coordinator)',
    specialInstructions: 'Park parallel along curb marked with yellow relief zone cones. Distribute water rations first.',
    mealType: 'Hot Nutritional Stews',
    pickupDepot: {
      id: 'depot-01',
      name: 'Central Food Bank Depot Alpha',
      code: 'DEP-ALPHA-01',
      address: '900 Pennsylvania Ave, Warehouse 4',
      window: '09:30 - 10:45',
      itemsReady: [
        { id: 'i1', name: 'Insulated Cambro - Hearty Lentil Stew (150-pack)', quantity: 3, unit: 'crates', checked: false },
        { id: 'i2', name: 'Whole Wheat Rolls & Fruit Kits', quantity: 450, unit: 'portions', checked: false },
        { id: 'i3', name: 'Hydration Pallet (500ml spring water)', quantity: 18, unit: 'cases', checked: false },
        { id: 'i4', name: 'Compostable Cutlery & Napkin Packs', quantity: 500, unit: 'sets', checked: false },
      ],
    },
  },
  {
    id: 'zone-02',
    name: 'Mission Cultural Transit Corridor',
    code: 'SF-MS-02',
    priorityIndex: 'PRIORITY 02',
    status: 'high_demand',
    urgencyLevel: 'URGENT NEED',
    coordinates: {
      lat: 37.7628,
      lng: -122.4191,
      gridRef: '37.7628° N, 122.4191° W [SEC-MS-02]',
    },
    address: '24th & Mission St Concourse',
    neighborhood: 'Mission District',
    targetMeals: 380,
    mealsServed: 120,
    timeWindow: '12:00 - 14:15',
    temperature: '65°F Clear',
    contactLead: 'R. Alvarez (Field Director)',
    specialInstructions: 'Pedestrian heavy. Deploy fold-out awning and ensure queue does not impede BART escalator exits.',
    mealType: 'Balanced Protein Boxes',
    pickupDepot: {
      id: 'depot-02',
      name: 'Bayside Relief Commissary',
      code: 'DEP-BAYSIDE-03',
      address: '1500 Illinois St, Dock 2',
      window: '10:15 - 11:30',
      itemsReady: [
        { id: 'i21', name: 'Thermal Boxes - Roasted Chicken & Quinoa', quantity: 4, unit: 'crates', checked: false },
        { id: 'i22', name: 'Vegan Protein Bowls (Tofu & Veggie)', quantity: 120, unit: 'portions', checked: false },
        { id: 'i23', name: 'Electrolyte Citrus Pouches', quantity: 16, unit: 'cases', checked: false },
      ],
    },
  },
  {
    id: 'zone-03',
    name: 'Bayview Hunters Point Senior Enclave',
    code: 'SF-BV-08',
    priorityIndex: 'PRIORITY 03',
    status: 'active_reserved',
    urgencyLevel: 'ACTIVE DISPATCH',
    coordinates: {
      lat: 37.7301,
      lng: -122.3854,
      gridRef: '37.7301° N, 122.3854° W [SEC-BV-08]',
    },
    address: '100 Keith St Community Center',
    neighborhood: 'Bayview District',
    targetMeals: 260,
    mealsServed: 185,
    timeWindow: '11:45 - 13:45',
    temperature: '67°F Sunny',
    assignedTruckId: 'UNIT-CIVIC-04',
    assignedDriver: 'Sarah Jenkins',
    contactLead: 'Elder Council Liaison',
    specialInstructions: 'Ramp access required for mobility walkers. Low-sodium dietary options clearly marked.',
    mealType: 'Fresh Produce & Soups',
    pickupDepot: {
      id: 'depot-01',
      name: 'Central Food Bank Depot Alpha',
      code: 'DEP-ALPHA-01',
      address: '900 Pennsylvania Ave, Warehouse 4',
      window: '09:00 - 10:15',
      itemsReady: [
        { id: 'i31', name: 'Low Sodium Vegetable Broth & Dumplings', quantity: 260, unit: 'portions', checked: true },
        { id: 'i32', name: 'Fresh Farm Produce Care Bags', quantity: 130, unit: 'bags', checked: true },
      ],
    },
  },
  {
    id: 'zone-04',
    name: 'SoMa Shelter Annex North Yard',
    code: 'SF-SM-01',
    priorityIndex: 'PRIORITY 04',
    status: 'supplied',
    urgencyLevel: 'STABLE',
    coordinates: {
      lat: 37.7785,
      lng: -122.4056,
      gridRef: '37.7785° N, 122.4056° W [SEC-SM-01]',
    },
    address: '525 5th St Annex Gate',
    neighborhood: 'South of Market',
    targetMeals: 310,
    mealsServed: 295,
    timeWindow: '10:30 - 12:45',
    temperature: '63°F Daylight',
    assignedTruckId: 'UNIT-CIVIC-02',
    assignedDriver: 'David Morales',
    contactLead: 'Shelter Supervisor T. Ortiz',
    specialInstructions: 'Verify identity wristbands gently. Excess inventory transfers to nightly shelter kitchen.',
    mealType: 'Family Rations',
    pickupDepot: {
      id: 'depot-03',
      name: 'Mission Bay Logistics Hub',
      code: 'DEP-MB-02',
      address: '450 16th St, Bay 1',
      window: '08:45 - 09:45',
      itemsReady: [
        { id: 'i41', name: 'Family Ration Packs (4-Person 48hr)', quantity: 80, unit: 'packs', checked: true },
      ],
    },
  },
  {
    id: 'zone-05',
    name: 'Western Addition Community Gardens',
    code: 'SF-WA-05',
    priorityIndex: 'PRIORITY 05',
    status: 'disbursed',
    urgencyLevel: 'COMPLETED',
    coordinates: {
      lat: 37.7798,
      lng: -122.4341,
      gridRef: '37.7798° N, 122.4341° W [SEC-WA-05]',
    },
    address: '1111 Buchanan St Pavillion',
    neighborhood: 'Western Addition',
    targetMeals: 220,
    mealsServed: 220,
    timeWindow: '09:00 - 11:00',
    temperature: '60°F Overcast',
    assignedTruckId: 'UNIT-CIVIC-07',
    assignedDriver: 'Elena Rostova',
    contactLead: 'K. Washington',
    specialInstructions: 'Service completed. Zone clean-up verified by civic inspector.',
    mealType: 'Fresh Produce & Soups',
    pickupDepot: {
      id: 'depot-01',
      name: 'Central Food Bank Depot Alpha',
      code: 'DEP-ALPHA-01',
      address: '900 Pennsylvania Ave, Warehouse 4',
      window: '07:30 - 08:30',
      itemsReady: [
        { id: 'i51', name: 'Completed Manifest Package', quantity: 220, unit: 'units', checked: true },
      ],
    },
  },
];
