import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Database with realistic, accurate Community Food Banks & Pantries data
let pantries = [
  {
    id: 'pantry-1',
    name: 'Second Harvest Mercy Partner Hub',
    organization: 'Second Harvest Food Bank of Central Florida',
    address: '411 Mercy Drive',
    city: 'Orlando',
    state: 'FL',
    zip: '32808',
    neighborhood: 'Mercy Drive / Northwest Orlando',
    distanceMiles: 1.2,
    openToday: true,
    hoursToday: '8:30 AM – 3:30 PM',
    scheduleDescription: 'Mon through Fri: 8:30am-3:30pm | Sat: 9am-1pm',
    phone: '(407) 295-1066',
    queueCars: 5,
    queueWaitMinutes: 9,
    queueTrend: 'speeding_up',
    lastQueueUpdate: '3 mins ago',
    badges: ['drive_thru', 'no_id', 'delivery', 'fresh_produce', 'food_desert_relief'],
    servesUnderprivilegedArea: true,
    vulnerabilityPriority: 'urgent',
    inventory: [
      { id: 'inv-1', name: 'Fresh Florida Farm Produce (Citrus, Sweet Corn, Greens)', category: 'produce', inStock: true },
      { id: 'inv-2', name: 'Whole Milk & Farm Fresh Eggs', category: 'dairy', inStock: true },
      { id: 'inv-3', name: 'High-Protein Black Beans, Lentils & Canned Tuna', category: 'protein', inStock: true },
      { id: 'inv-4', name: 'Masa Harina, Long Grain Rice & Rolled Oats', category: 'staples', inStock: true },
      { id: 'inv-5', name: 'Infant Formula & Diapers (Sizes 2–5)', category: 'baby', inStock: true },
      { id: 'inv-6', name: 'Hearty Ready-to-Eat Vegetable & Bean Stew', category: 'prepared', inStock: true }
    ],
    driveThruLaneActive: true,
    walkUpLaneActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=900&q=80',
    coordinates: { lat: 28.5685, lng: -81.4290 },
    notes: 'Drive-thru entrance off Mercy Dr. Rapid 2-lane vehicle trunk loading. Shaded walk-up welcome center on North bay with cold water bottles.',
    languagesSpoken: ['English', 'Español', 'Kreyòl Ayisyen']
  },
  {
    id: 'pantry-2',
    name: 'Parramore Community Dignity Market & Drive-Thru',
    organization: 'Central Florida Mutual Aid Network',
    address: '650 W. Church Street',
    city: 'Orlando',
    state: 'FL',
    zip: '32805',
    neighborhood: 'Historic Parramore / Downtown West',
    distanceMiles: 0.6,
    openToday: true,
    hoursToday: '9:00 AM – 4:30 PM',
    scheduleDescription: 'Tue, Thu, Sat: 9am-4:30pm',
    phone: '(407) 841-3320',
    queueCars: 4,
    queueWaitMinutes: 7,
    queueTrend: 'stable',
    lastQueueUpdate: '1 min ago',
    badges: ['drive_thru', 'no_id', 'hot_meals', 'food_desert_relief', 'delivery'],
    servesUnderprivilegedArea: true,
    vulnerabilityPriority: 'urgent',
    inventory: [
      { id: 'inv-7', name: 'Fresh Florida Oranges, Sweet Potatoes & Collards', category: 'produce', inStock: true },
      { id: 'inv-8', name: 'Almond Milk & Lactose-Free Dairy', category: 'dairy', inStock: true },
      { id: 'inv-9', name: 'Halal Certified Poultry & Canned Sardines', category: 'protein', inStock: true },
      { id: 'inv-10', name: 'Cornbread Mix, Enriched Rice & Cooking Oil', category: 'staples', inStock: true },
      { id: 'inv-11', name: 'Hot Ready-to-Eat Hearty Chicken & Rice Lunches', category: 'prepared', inStock: true }
    ],
    driveThruLaneActive: true,
    walkUpLaneActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    coordinates: { lat: 28.5392, lng: -81.3895 },
    notes: 'Located west of I-4 in historic Parramore. Hot meals distributed 11:30am-1:30pm. Contactless grocery drop directly into vehicle trunk.',
    languagesSpoken: ['English', 'Español']
  },
  {
    id: 'pantry-3',
    name: 'Pine Hills Community Harvest Food Center',
    organization: 'Pine Hills Community Coalition',
    address: '5100 N. Pine Hills Road',
    city: 'Orlando',
    state: 'FL',
    zip: '32808',
    neighborhood: 'Pine Hills / Silver Star',
    distanceMiles: 2.8,
    openToday: true,
    hoursToday: '10:00 AM – 5:30 PM',
    scheduleDescription: 'Mon, Wed, Fri, Sat: 10am-5:30pm',
    phone: '(407) 521-8900',
    queueCars: 8,
    queueWaitMinutes: 12,
    queueTrend: 'stable',
    lastQueueUpdate: '5 mins ago',
    badges: ['drive_thru', 'no_id', 'fresh_produce', 'halal_kosher', 'food_desert_relief'],
    servesUnderprivilegedArea: true,
    vulnerabilityPriority: 'urgent',
    inventory: [
      { id: 'inv-12', name: 'Organic Garden Greens, Tomatoes & Plantains', category: 'produce', inStock: true },
      { id: 'inv-13', name: 'Sourdough Loaves & Corn Tortillas', category: 'staples', inStock: true },
      { id: 'inv-14', name: 'Nutritional Yeast, Tofu & Plant Milks', category: 'dairy', inStock: true },
      { id: 'inv-15', name: 'Baby Purees & Natural Teethers', category: 'baby', inStock: true }
    ],
    driveThruLaneActive: true,
    walkUpLaneActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80',
    coordinates: { lat: 28.5870, lng: -81.4590 },
    notes: 'Wide drive-thru apron accommodating up to 20 vehicles. Fresh citrus, sweet potatoes, greens, beans, and halal poultry in stock.',
    languagesSpoken: ['English', 'Kreyòl Ayisyen', 'Español']
  },
  {
    id: 'pantry-4',
    name: 'South OBT Hope Pantry & Warm Kitchen',
    organization: 'Orange Blossom Trail Development Board',
    address: '3900 S. Orange Blossom Trail',
    city: 'Orlando',
    state: 'FL',
    zip: '32839',
    neighborhood: 'Holden Heights / South OBT',
    distanceMiles: 3.1,
    openToday: true,
    hoursToday: '1:00 PM – 6:00 PM',
    scheduleDescription: 'Daily 1:00pm-6:00pm',
    phone: '(407) 425-4422',
    queueCars: 3,
    queueWaitMinutes: 5,
    queueTrend: 'speeding_up',
    lastQueueUpdate: '2 mins ago',
    badges: ['no_id', 'delivery', 'hot_meals', 'food_desert_relief'],
    servesUnderprivilegedArea: true,
    vulnerabilityPriority: 'urgent',
    inventory: [
      { id: 'inv-16', name: 'Canned Hearty Soups, Stews & Chili', category: 'staples', inStock: true },
      { id: 'inv-17', name: 'Fresh Bakery Bread & Pastries', category: 'staples', inStock: true },
      { id: 'inv-18', name: 'Ready-to-Eat Microwaveable Protein Bowls', category: 'prepared', inStock: true }
    ],
    driveThruLaneActive: false,
    walkUpLaneActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=900&q=80',
    coordinates: { lat: 28.5085, lng: -81.3980 },
    notes: 'Serving families residing along South OBT corridor and extended stay suites. Easy microwaveable and ready-to-eat pantry staples.',
    languagesSpoken: ['English', 'Español']
  },
  {
    id: 'pantry-5',
    name: 'East Orlando / Azalea Park Solidarity Pantry',
    organization: 'East Central Florida Community Alliance',
    address: '1020 S. Semoran Blvd',
    city: 'Orlando',
    state: 'FL',
    zip: '32807',
    neighborhood: 'Azalea Park / East Colonial',
    distanceMiles: 4.2,
    openToday: true,
    hoursToday: '11:00 AM – 5:00 PM',
    scheduleDescription: 'Tue through Sat: 11am-5pm',
    phone: '(407) 277-5100',
    queueCars: 4,
    queueWaitMinutes: 7,
    queueTrend: 'stable',
    lastQueueUpdate: '4 mins ago',
    badges: ['drive_thru', 'no_id', 'delivery', 'fresh_produce', 'food_desert_relief'],
    servesUnderprivilegedArea: true,
    vulnerabilityPriority: 'high',
    inventory: [
      { id: 'inv-19', name: 'Farm Crisp Greens, Yuca, Plantains & Fruit', category: 'produce', inStock: true },
      { id: 'inv-20', name: 'Brown Rice, Black Beans & Canned Tuna', category: 'staples', inStock: true },
      { id: 'inv-21', name: 'Baby Formula & Diapers (Sizes Newborn to 4)', category: 'baby', inStock: true }
    ],
    driveThruLaneActive: true,
    walkUpLaneActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=900&q=80',
    coordinates: { lat: 28.5440, lng: -81.3100 },
    notes: 'Drive-thru alongside church pavilion. Specializing in family bundles with plantains, yuca, rice, black beans, eggs, and dairy.',
    languagesSpoken: ['Español', 'English']
  },
  {
    id: 'pantry-6',
    name: 'Lake Eola Heights Community Table',
    organization: 'Downtown Orlando Food Rescue',
    address: '310 N. Rosalind Ave',
    city: 'Orlando',
    state: 'FL',
    zip: '32801',
    neighborhood: 'Downtown Orlando / Lake Eola',
    distanceMiles: 0.5,
    openToday: false,
    hoursToday: 'Reopens Tomorrow at 9:00 AM',
    scheduleDescription: 'Mon, Wed, Fri: 9am-1pm',
    phone: '(407) 246-2121',
    queueCars: 0,
    queueWaitMinutes: 0,
    queueTrend: 'stable',
    lastQueueUpdate: 'Yesterday',
    badges: ['no_id', 'hot_meals'],
    servesUnderprivilegedArea: false,
    vulnerabilityPriority: 'moderate',
    inventory: [
      { id: 'inv-22', name: 'Fresh Artisan Bakery Breads & Bagels', category: 'staples', inStock: true },
      { id: 'inv-23', name: 'Hot Roasted Vegetable Soup', category: 'prepared', inStock: true }
    ],
    driveThruLaneActive: false,
    walkUpLaneActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=900&q=80',
    coordinates: { lat: 28.5450, lng: -81.3760 },
    notes: 'Walk-up table in downtown park pavilion with fresh pastries and warm coffee.',
    languagesSpoken: ['English', 'Español']
  }
];

let fridges = [
  {
    id: 'fridge-1',
    name: 'Orlando Community Fridge (Downtown / Mills 50)',
    location: '1012 N. Mills Ave',
    city: 'Orlando, FL 32803',
    coordinates: { lat: 28.5562, lng: -81.3645 },
    access: 'Open 24 hours, 7 days a week',
    stock: 'Fresh Florida produce, boxed meals, cold spring water, artisan bread',
    rule: 'Take what you need, leave what you can. No questions asked.',
    status: 'stocked_now'
  },
  {
    id: 'fridge-2',
    name: 'Parramore Solidarity Cooler',
    location: '520 W. South Street',
    city: 'Orlando, FL 32805',
    coordinates: { lat: 28.5370, lng: -81.3870 },
    access: 'Open 7:00 AM – 9:00 PM Daily',
    stock: 'Local farm citrus, baby formula, shelf-stable milk, cold drinks',
    rule: 'Outdoor sheltered mutual aid box with solar lights.',
    status: 'stocked_now'
  },
  {
    id: 'fridge-3',
    name: 'Pine Hills Free Bread & Produce Stand',
    location: '4800 Silver Star Road',
    city: 'Orlando, FL 32808',
    coordinates: { lat: 28.5835, lng: -81.4510 },
    access: 'Open 24 hours daily',
    stock: 'Daily bakery rescues, seasonal vegetables, canned beans and tuna',
    rule: 'Completely free self-serve community pantry open to all neighbors.',
    status: 'stocked_now'
  }
];

let underprivilegedZones = [
  {
    id: 'zone-parramore',
    name: 'Historic Parramore Food Desert Tract',
    designation: 'Severe Food Desert' as const,
    vulnerabilityScore: 95,
    povertyRate: '43.8%',
    snapParticipationRate: '51%',
    zeroVehicleHouseholds: '44%',
    avgSupermarketDistanceMiles: 1.6,
    description: 'Historic African-American neighborhood west of I-4. Designated federal LILA zone with extreme supermarket deficit, high pedestrian transit dependency, and acute food insecurity.',
    centerCoordinates: { lat: 28.5385, lng: -81.3895 },
    boundaryPolygon: [
      [28.5480, -81.3980],
      [28.5470, -81.3810],
      [28.5290, -81.3820],
      [28.5300, -81.3990]
    ] as [number, number][],
    servingPantryIds: ['pantry-2'],
    keyChallenges: ['I-4 interstate barrier to downtown markets', 'No full commercial supermarket within tract', 'High senior and child poverty']
  },
  {
    id: 'zone-mercy',
    name: 'Mercy Drive Subsidized Housing Corridor',
    designation: 'Severe Food Desert' as const,
    vulnerabilityScore: 97,
    povertyRate: '48.2%',
    snapParticipationRate: '58%',
    zeroVehicleHouseholds: '52%',
    avgSupermarketDistanceMiles: 2.1,
    description: 'Highest density of subsidized family housing in Orange County. Isolated geography between industrial parks with zero walking-distance grocery retailers.',
    centerCoordinates: { lat: 28.5685, lng: -81.4290 },
    boundaryPolygon: [
      [28.5770, -81.4360],
      [28.5760, -81.4210],
      [28.5590, -81.4220],
      [28.5600, -81.4370]
    ] as [number, number][],
    servingPantryIds: ['pantry-1'],
    keyChallenges: ['52% zero-vehicle households', 'No grocery stores within 2 miles', 'Extreme child hunger risk']
  },
  {
    id: 'zone-pinehills',
    name: 'Pine Hills / Silver Star Priority Food Zone',
    designation: 'Severe Food Desert' as const,
    vulnerabilityScore: 92,
    povertyRate: '36.4%',
    snapParticipationRate: '47%',
    zeroVehicleHouseholds: '38%',
    avgSupermarketDistanceMiles: 1.9,
    description: 'Large multicultural community with dense Haitian, Caribbean, and Hispanic working families. High transit travel times to fresh grocers and severe corner-store markups.',
    centerCoordinates: { lat: 28.5860, lng: -81.4580 },
    boundaryPolygon: [
      [28.6010, -81.4720],
      [28.5990, -81.4440],
      [28.5720, -81.4450],
      [28.5730, -81.4740]
    ] as [number, number][],
    servingPantryIds: ['pantry-3', 'pantry-1'],
    keyChallenges: ['Lynx bus transit desert', 'High cost of fresh produce', 'Language navigation barriers']
  },
  {
    id: 'zone-obt',
    name: 'Holden Heights / South OBT Corridor',
    designation: 'High Need / Low Access' as const,
    vulnerabilityScore: 89,
    povertyRate: '38.1%',
    snapParticipationRate: '44%',
    zeroVehicleHouseholds: '41%',
    avgSupermarketDistanceMiles: 1.5,
    description: 'Stretching along South Orange Blossom Trail. Many families living in weekly-rate motels and studio apartments lacking stoves and refrigeration.',
    centerCoordinates: { lat: 28.5085, lng: -81.3980 },
    boundaryPolygon: [
      [28.5200, -81.4080],
      [28.5190, -81.3880],
      [28.4970, -81.3890],
      [28.4980, -81.4090]
    ] as [number, number][],
    servingPantryIds: ['pantry-4'],
    keyChallenges: ['Motel living without kitchens', 'Pedestrian safety along Highway 441', 'High immigrant hospitality workforce']
  },
  {
    id: 'zone-azalea',
    name: 'Azalea Park / East Colonial Relief Zone',
    designation: 'High Need / Low Access' as const,
    vulnerabilityScore: 84,
    povertyRate: '27.8%',
    snapParticipationRate: '36%',
    zeroVehicleHouseholds: '31%',
    avgSupermarketDistanceMiles: 1.3,
    description: 'East Orlando working-class community home to hospitality and service workers powering Central Florida tourism, burdened by extreme rental inflation.',
    centerCoordinates: { lat: 28.5440, lng: -81.3100 },
    boundaryPolygon: [
      [28.5560, -81.3220],
      [28.5550, -81.2970],
      [28.5320, -81.2980],
      [28.5330, -81.3230]
    ] as [number, number][],
    servingPantryIds: ['pantry-5'],
    keyChallenges: ['Tourism wage vulnerability', 'Severe housing rent squeeze', 'Lack of bilingual outreach']
  }
];

let deliveries = [
  {
    id: 'del-101',
    recipientName: 'Maria G. (Elderly Senior)',
    phone: '(407) 321-7789',
    address: '680 W. Church St, Apt 3B',
    neighborhood: 'Historic Parramore / Downtown West',
    coordinates: { lat: 28.5395, lng: -81.3905 },
    householdSize: 2,
    boxType: 'senior_wellness',
    dietaryRestrictions: ['Low Sodium', 'Diabetic Friendly'],
    safeDropNotes: 'Third floor, buzzer #32. Please leave box right outside door and ring twice so Maria knows it has arrived. Elevator in building.',
    urgency: 'routine',
    status: 'assigned',
    assignedDriverId: 'driver-me',
    assignedDriverName: 'You (Volunteer Steward)',
    requestedAt: 'Today, 10:15 AM',
    deliveryWindow: '1:30 PM – 2:30 PM'
  },
  {
    id: 'del-102',
    recipientName: 'The Hernandez Family',
    phone: '(407) 882-1940',
    address: '4820 Silver Star Rd',
    neighborhood: 'Pine Hills / Silver Star',
    coordinates: { lat: 28.5840, lng: -81.4520 },
    householdSize: 5,
    boxType: 'family_bounty',
    dietaryRestrictions: ['Fresh Florida Produce Focus', 'Baby Formula (Size 3)'],
    safeDropNotes: 'Single-story home with carport. Please place under covered porch behind the white planter to protect from afternoon sun.',
    urgency: 'urgent_today',
    status: 'assigned',
    assignedDriverId: 'driver-me',
    assignedDriverName: 'You (Volunteer Steward)',
    requestedAt: 'Today, 11:30 AM',
    deliveryWindow: '2:45 PM – 3:45 PM'
  },
  {
    id: 'del-103',
    recipientName: 'David K. (Immunocompromised)',
    phone: '(407) 431-9022',
    address: '3840 S. Orange Blossom Trail, Unit 12',
    neighborhood: 'Holden Heights / South OBT',
    coordinates: { lat: 28.5100, lng: -81.3990 },
    householdSize: 1,
    boxType: 'diabetic_care',
    dietaryRestrictions: ['Strict Contactless', 'Gluten Sensitive'],
    safeDropNotes: 'Completely contactless please. Gate code is #4091. Place directly on the chair next to motel unit entry.',
    urgency: 'routine',
    status: 'pending',
    requestedAt: 'Today, 12:05 PM',
    deliveryWindow: '4:00 PM – 5:30 PM'
  }
];

let shifts = [
  {
    id: 'shift-1',
    pantryId: 'pantry-1',
    pantryName: 'Second Harvest Mercy Partner Hub',
    role: 'delivery_driver',
    title: 'Orange County Doorstep Route (4–6 Drops)',
    date: 'Today, Nov 7',
    timeSlot: '1:30 PM – 4:00 PM',
    spotsTotal: 5,
    spotsClaimed: 3,
    location: 'Loading Bay 2, 411 Mercy Drive, Orlando',
    isUrgent: true,
    requirements: ['Valid Driver License', 'Smartphone for safe-drop photos', 'Trunk space for 4–6 totes'],
    claimedByCurrentUser: true
  },
  {
    id: 'shift-2',
    pantryId: 'pantry-2',
    pantryName: 'Parramore Community Dignity Market',
    role: 'drive_thru_director',
    title: 'Church St Drive-Thru Lane Traffic & Greeting Marshall',
    date: 'Tomorrow, Nov 8',
    timeSlot: '8:45 AM – 12:30 PM',
    spotsTotal: 4,
    spotsClaimed: 2,
    location: 'Drive-thru Entry Gate, 650 W. Church St',
    isUrgent: false,
    requirements: ['High-visibility vest (provided)', 'Warm greeting disposition', 'Comfortable standing outdoors'],
    claimedByCurrentUser: false
  },
  {
    id: 'shift-3',
    pantryId: 'pantry-3',
    pantryName: 'Pine Hills Community Harvest Center',
    role: 'box_packer',
    title: 'Fresh Citrus & Farm Produce Crate Assembly',
    date: 'Tomorrow, Nov 8',
    timeSlot: '1:00 PM – 3:30 PM',
    spotsTotal: 8,
    spotsClaimed: 5,
    location: 'Main Packing Warehouse, 5100 N. Pine Hills Rd',
    isUrgent: false,
    requirements: ['Closed-toe shoes', 'Able to lift 15-20 lbs comfortably'],
    claimedByCurrentUser: false
  },
  {
    id: 'shift-4',
    pantryId: 'pantry-5',
    pantryName: 'East Orlando / Azalea Park Pantry',
    role: 'food_rescue_driver',
    title: 'Supermarket Fresh Surplus Harvest Run',
    date: 'Saturday, Nov 9',
    timeSlot: '7:30 AM – 10:30 AM',
    spotsTotal: 2,
    spotsClaimed: 1,
    location: 'Departs from 1020 S. Semoran Blvd, Orlando',
    isUrgent: true,
    requirements: ['SUV, Van, or Truck preferred', 'Assists in moving bakery & produce crates'],
    claimedByCurrentUser: false
  }
];

// --- REST API ENDPOINTS ---

// 1. GET /api/pantries - Filter by search, badge, open status, radius
app.get('/api/pantries', (req: Request, res: Response) => {
  const { search, badge, open_now, lat, lng, radius_miles } = req.query;

  let results = [...pantries];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.organization.toLowerCase().includes(q) ||
        p.zip.includes(q)
    );
  }

  if (open_now === 'true') {
    results = results.filter((p) => p.openToday);
  }

  if (badge && typeof badge === 'string' && badge !== 'all') {
    results = results.filter((p) => p.badges.includes(badge as any));
  }

  // Calculate distances if user coordinates provided
  if (lat && lng) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    results = results.map((p) => {
      // Haversine formula
      const R = 3958.8; // Radius of Earth in miles
      const dLat = ((p.coordinates.lat - userLat) * Math.PI) / 180;
      const dLng = ((p.coordinates.lng - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((p.coordinates.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = parseFloat((R * c).toFixed(1));
      return { ...p, distanceMiles: dist };
    });

    if (radius_miles) {
      const maxDist = parseFloat(radius_miles as string);
      results = results.filter((p) => p.distanceMiles <= maxDist);
    }

    results.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

// 2. GET /api/pantries/:id
app.get('/api/pantries/:id', (req: Request, res: Response) => {
  const pantry = pantries.find((p) => p.id === req.params.id);
  if (!pantry) {
    return res.status(404).json({ success: false, error: 'Pantry not found' });
  }
  res.json({ success: true, data: pantry });
});

// 3. POST /api/pantries/:id/queue - Update live queue
app.post('/api/pantries/:id/queue', (req: Request, res: Response) => {
  const { queueCars, queueWaitMinutes, queueTrend } = req.body;
  const index = pantries.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Pantry not found' });
  }

  pantries[index] = {
    ...pantries[index],
    queueCars: typeof queueCars === 'number' ? queueCars : pantries[index].queueCars,
    queueWaitMinutes: typeof queueWaitMinutes === 'number' ? queueWaitMinutes : pantries[index].queueWaitMinutes,
    queueTrend: queueTrend || pantries[index].queueTrend,
    lastQueueUpdate: 'Just now'
  };

  res.json({
    success: true,
    message: 'Live queue updated successfully',
    data: pantries[index]
  });
});

// 4. PATCH /api/pantries/:id/inventory - Toggle inventory items
app.patch('/api/pantries/:id/inventory', (req: Request, res: Response) => {
  const { itemId, inStock } = req.body;
  const index = pantries.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Pantry not found' });
  }

  pantries[index].inventory = pantries[index].inventory.map((item) => {
    if (item.id === itemId) {
      return { ...item, inStock: inStock !== undefined ? inStock : !item.inStock };
    }
    return item;
  });

  res.json({
    success: true,
    message: 'Inventory updated',
    data: pantries[index]
  });
});

// 5. GET /api/fridges - 24/7 Mutual aid community fridges
app.get('/api/fridges', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: fridges.length,
    data: fridges
  });
});

// 5b. GET /api/vulnerability-zones - Underprivileged & Food Insecurity Zones
app.get('/api/vulnerability-zones', (_req: Request, res: Response) => {
  res.json({
    success: true,
    total: underprivilegedZones.length,
    data: underprivilegedZones
  });
});

app.get('/api/vulnerability-zones/:id', (req: Request, res: Response) => {
  const zone = underprivilegedZones.find((z) => z.id === req.params.id);
  if (!zone) {
    return res.status(404).json({ success: false, error: 'Vulnerability zone not found' });
  }
  res.json({ success: true, data: zone });
});

// 6. GET /api/deliveries - List mutual aid deliveries
app.get('/api/deliveries', (req: Request, res: Response) => {
  const { status, driver } = req.query;
  let results = [...deliveries];

  if (status && typeof status === 'string') {
    results = results.filter((d) => d.status === status);
  }
  if (driver && typeof driver === 'string') {
    results = results.filter((d) => d.assignedDriverId === driver);
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

// 7. POST /api/deliveries - Create doorstep mutual aid delivery
app.post('/api/deliveries', (req: Request, res: Response) => {
  const {
    recipientName,
    phone,
    address,
    neighborhood,
    householdSize,
    boxType,
    dietaryRestrictions,
    safeDropNotes,
    urgency
  } = req.body;

  if (!recipientName || !phone || !address) {
    return res.status(400).json({
      success: false,
      error: 'recipientName, phone, and address are required'
    });
  }

  const newDelivery = {
    id: `del-${Date.now().toString().slice(-4)}`,
    recipientName,
    phone,
    address,
    neighborhood: neighborhood || 'Local Neighborhood',
    coordinates: { lat: 37.7600 + (Math.random() - 0.5) * 0.04, lng: -122.4150 + (Math.random() - 0.5) * 0.04 },
    householdSize: householdSize || 1,
    boxType: boxType || 'family_bounty',
    dietaryRestrictions: dietaryRestrictions || [],
    safeDropNotes: safeDropNotes || 'Leave at doorstep, knock twice.',
    urgency: urgency || 'routine',
    status: 'pending' as const,
    requestedAt: 'Just now',
    deliveryWindow: 'Today, 2:00 PM – 4:30 PM'
  };

  deliveries.unshift(newDelivery);

  res.status(201).json({
    success: true,
    message: 'Delivery request submitted to volunteer dispatch queue',
    data: newDelivery
  });
});

// 8. PATCH /api/deliveries/:id - Update status / driver / safe-drop proof
app.patch('/api/deliveries/:id', (req: Request, res: Response) => {
  const { status, assignedDriverId, assignedDriverName, proofPhotoUrl } = req.body;
  const index = deliveries.findIndex((d) => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Delivery not found' });
  }

  deliveries[index] = {
    ...deliveries[index],
    ...(status ? { status } : {}),
    ...(assignedDriverId ? { assignedDriverId } : {}),
    ...(assignedDriverName ? { assignedDriverName } : {}),
    ...(proofPhotoUrl ? { proofPhotoUrl, deliveredAt: 'Just now' } : {})
  };

  res.json({
    success: true,
    message: 'Delivery updated',
    data: deliveries[index]
  });
});

// 9. GET /api/shifts & POST /api/shifts/:id/claim
app.get('/api/shifts', (_req: Request, res: Response) => {
  res.json({ success: true, total: shifts.length, data: shifts });
});

app.post('/api/shifts/:id/claim', (req: Request, res: Response) => {
  const index = shifts.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Shift not found' });
  }

  const isCurrentlyClaimed = shifts[index].claimedByCurrentUser;
  shifts[index].claimedByCurrentUser = !isCurrentlyClaimed;
  shifts[index].spotsClaimed += !isCurrentlyClaimed ? 1 : -1;

  res.json({
    success: true,
    message: !isCurrentlyClaimed ? 'Shift claimed!' : 'Shift un-claimed',
    data: shifts[index]
  });
});

// 10. POST /api/snap/estimate - Accurate USDA FNS 2025/2026 benefit calculation formula
app.post('/api/snap/estimate', (req: Request, res: Response) => {
  const {
    householdSize = 3,
    monthlyIncome = 1800,
    rentMortgage = 950,
    childcareOrMedical = 200,
    hasChildrenUnder5 = false,
    hasSeniorsOrDisabled = false
  } = req.body;

  // Maximum Allotments by Household Size (Official 2025/2026 USDA guidelines)
  const maxAllotments: { [key: number]: number } = {
    1: 292,
    2: 536,
    3: 768,
    4: 975,
    5: 1158,
    6: 1390,
    7: 1536,
    8: 1756
  };
  const size = Math.max(1, parseInt(householdSize));
  const maxBenefit = maxAllotments[Math.min(8, size)] || (1756 + (size - 8) * 220);

  // 1. Standard deduction (2025 USDA: $200 for 1-3 people, $225 for 4+)
  const standardDeduction = size <= 3 ? 200 : 225;

  // 2. 20% earned income deduction
  const earnedDeduction = monthlyIncome * 0.2;

  // 3. Excess shelter deduction (rent/mortgage minus 50% of adjusted income)
  const adjustedIncomeBeforeShelter = Math.max(0, monthlyIncome - standardDeduction - earnedDeduction - childcareOrMedical);
  const halfAdjusted = adjustedIncomeBeforeShelter * 0.5;
  const excessShelter = Math.max(0, rentMortgage - halfAdjusted);
  // Cap for shelter deduction unless household has seniors or disabled members
  const maxShelterCap = hasSeniorsOrDisabled ? Infinity : 712;
  const actualShelterDeduction = Math.min(excessShelter, maxShelterCap);

  const netIncome = Math.max(0, adjustedIncomeBeforeShelter - actualShelterDeduction);

  // SNAP formula: Benefit = Max Allotment - (30% of Net Income)
  const expectedContribution = netIncome * 0.3;
  const estimatedSnap = Math.max(95, Math.min(maxBenefit, Math.round(maxBenefit - expectedContribution)));

  // WIC Nutrition Allocation ($120/mo per child under 5 or pregnant member)
  const wicMonthly = hasChildrenUnder5 ? 120 : 0;

  // Double-Up Food Bucks Match ($1-for-$1 at farmers markets up to $80/mo)
  const doubleUpBucks = 80;

  res.json({
    success: true,
    data: {
      householdSize: size,
      estimatedSnapMonthly: estimatedSnap,
      wicMonthly,
      doubleUpBucks,
      totalMonthlyFoodAssistance: estimatedSnap + wicMonthly,
      maxPossibleAllotment: maxBenefit,
      breakdown: {
        standardDeduction,
        earnedDeduction,
        shelterDeduction: actualShelterDeduction,
        netIncome
      }
    }
  });
});

// 11. GET /api/embed/pantries - Lightweight public JSON feed for external widgets
app.get('/api/embed/pantries', (_req: Request, res: Response) => {
  res.json({
    app: 'NourishTogether',
    version: '1.2.0',
    pantries: pantries.map((p) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      neighborhood: p.neighborhood,
      coordinates: p.coordinates,
      queueCars: p.queueCars,
      queueWaitMinutes: p.queueWaitMinutes,
      queueTrend: p.queueTrend,
      openToday: p.openToday,
      hoursToday: p.hoursToday,
      badges: p.badges
    }))
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NourishTogether API and Applet server running on port ${PORT}`);
  });
}

startServer();
