import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Pantry, DeliveryRequest, VolunteerShift } from '../types';

// 1. Initialize Firebase App and Services
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 2. Strict Error Handling conforming to SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Test Connection
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}

// Run connection probe
testFirestoreConnection();

// 4. Auth helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Auth sign in error:', error);
    return null;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export function onUserChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 5. Pantries & Live Queue Subscriptions
export function subscribeToPantries(
  onData: (pantries: Pantry[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'pantries';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const pantries = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          })) as Pantry[];
          onData(pantries);
        }
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function submitFirestoreQueueReport(
  pantryId: string,
  queueCars: number,
  queueWaitMinutes: number,
  queueTrend: 'speeding_up' | 'stable' | 'slowing_down'
) {
  const subPath = `pantries/${pantryId}/queue_reports`;
  try {
    await addDoc(collection(db, subPath), {
      pantryId,
      queueCars,
      queueWaitMinutes,
      queueTrend,
      reporterId: auth.currentUser?.uid || 'anonymous_neighbor',
      createdAt: new Date().toISOString()
    });

    // Also update current status on the pantry document if permitted
    const pantryPath = `pantries/${pantryId}`;
    try {
      await updateDoc(doc(db, pantryPath), {
        queueCars,
        queueWaitMinutes,
        queueTrend,
        lastQueueUpdate: 'Just now'
      });
    } catch {
      // Ignored if pantry update rule restricted
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, subPath);
  }
}

// 6. Delivery Requests
export function subscribeToDeliveryRequests(
  onData: (requests: DeliveryRequest[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'delivery_requests';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
          })) as DeliveryRequest[];
          onData(list);
        }
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function createFirestoreDeliveryRequest(
  request: Partial<DeliveryRequest> & { recipientName: string; phone: string; address: string }
): Promise<{ success: boolean; id: string }> {
  const path = 'delivery_requests';
  const cleanId = request.id && /^[a-zA-Z0-9_\-]+$/.test(request.id)
    ? request.id
    : `del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  try {
    const sanitizedPayload = {
      id: cleanId,
      recipientName: request.recipientName.trim().slice(0, 128),
      phone: request.phone.trim().slice(0, 32),
      address: request.address.trim().slice(0, 256),
      neighborhood: (request.neighborhood || 'Orlando Community Relief Zone').trim().slice(0, 128),
      householdSize: Math.max(1, Math.min(25, Number(request.householdSize) || 2)),
      boxType: (request.boxType || 'family_bounty').slice(0, 64),
      dietaryRestrictions: Array.isArray(request.dietaryRestrictions)
        ? request.dietaryRestrictions.slice(0, 10).map((d) => String(d).slice(0, 48))
        : [],
      safeDropNotes: (request.safeDropNotes || 'Leave at doorstep, knock twice.').trim().slice(0, 500),
      urgency: (request.urgency === 'urgent_today' ? 'urgent_today' : 'routine') as 'urgent_today' | 'routine',
      status: 'pending' as const,
      requestedAt: request.requestedAt || 'Just now',
      deliveryWindow: request.deliveryWindow || 'Today, 2:00 PM – 4:30 PM',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, path, cleanId), sanitizedPayload);
    console.info(`[Firebase Firestore] Drop-off request ${cleanId} successfully saved to ${path}`);
    return { success: true, id: cleanId };
  } catch (error) {
    console.error(`[Firebase Firestore] Failed saving drop-off request to ${path}/${cleanId}:`, error);
    handleFirestoreError(error, OperationType.CREATE, `${path}/${cleanId}`);
    return { success: false, id: cleanId };
  }
}

export async function updateFirestoreDeliveryStatus(
  requestId: string,
  status: DeliveryRequest['status'],
  driverId: string,
  driverName: string
) {
  const path = `delivery_requests/${requestId}`;
  try {
    await updateDoc(doc(db, path), {
      status,
      assignedDriverId: driverId,
      assignedDriverName: driverName,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 7. Volunteer Shifts
export function subscribeToVolunteerShifts(
  onData: (shifts: VolunteerShift[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'volunteer_shifts';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
          })) as VolunteerShift[];
          onData(list);
        }
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function claimFirestoreShift(shiftId: string, currentSpotsClaimed: number) {
  const path = `volunteer_shifts/${shiftId}`;
  try {
    await updateDoc(doc(db, path), {
      spotsClaimed: currentSpotsClaimed + 1,
      claimedByCurrentUser: true,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 8. Mock Request Generator for Firebase Firestore & Doorsteps
const MOCK_ORLANDO_RECIPIENTS = [
  {
    name: 'Elena Rostova & Family',
    phone: '(407) 555-8291',
    address: '680 W. Church St, Apt 2C',
    neighborhood: 'Historic Parramore / Downtown West',
    householdSize: 4,
    boxType: 'family_bounty' as const,
    dietaryRestrictions: ['Nut-free', 'Halal-friendly'],
    safeDropNotes: 'Leave on covered front porch behind flower planter. Ring bell twice.',
    urgency: 'urgent_today' as const,
    deliveryWindow: 'Today, 2:30 PM – 4:00 PM',
    coordinates: { lat: 28.5395, lng: -81.3905 }
  },
  {
    name: 'Marcus & Keisha Johnson',
    phone: '(407) 555-3419',
    address: '1420 Mercy Dr, Unit 104',
    neighborhood: 'Mercy Drive / Northwest Orlando',
    householdSize: 5,
    boxType: 'family_bounty' as const,
    dietaryRestrictions: ['Diabetic Low-Sugar', 'Fresh Greens'],
    safeDropNotes: 'First floor apartment. Leave right by doormat. Baby napping so please do not knock loud.',
    urgency: 'routine' as const,
    deliveryWindow: 'Today, 3:00 PM – 5:30 PM',
    coordinates: { lat: 28.5680, lng: -81.4285 }
  },
  {
    name: 'Grandma Beverly Thompson',
    phone: '(407) 555-6721',
    address: '4820 Powers Dr',
    neighborhood: 'Pine Hills / Silver Star',
    householdSize: 1,
    boxType: 'senior_wellness' as const,
    dietaryRestrictions: ['Low-Sodium', 'Soft-texture fruits'],
    safeDropNotes: 'Senior neighbor with limited mobility. Please set box on porch chair next to screen door.',
    urgency: 'urgent_today' as const,
    deliveryWindow: 'Today, 1:45 PM – 3:15 PM',
    coordinates: { lat: 28.5840, lng: -81.4520 }
  },
  {
    name: 'Sofia Morales & Kids',
    phone: '(407) 555-1944',
    address: '2910 S. Orange Blossom Trail, Apt 4',
    neighborhood: 'Holden Heights / South OBT',
    householdSize: 3,
    boxType: 'baby_essentials' as const,
    dietaryRestrictions: ['Whole Milk', 'No pork', 'Fresh bananas'],
    safeDropNotes: 'Drop behind privacy fence gate. Gate code #1944. Text when landed.',
    urgency: 'routine' as const,
    deliveryWindow: 'Today, 4:00 PM – 6:00 PM',
    coordinates: { lat: 28.5100, lng: -81.3990 }
  },
  {
    name: 'Amir & Fatima Al-Mansoor',
    phone: '(407) 555-7033',
    address: '1240 S. Semoran Blvd, Apt 18',
    neighborhood: 'Azalea Park / East Colonial',
    householdSize: 4,
    boxType: 'halal_staples' as const,
    dietaryRestrictions: ['100% Halal certified meat', 'Lentils & Rice'],
    safeDropNotes: 'Leave outside side entrance under awning. Thank you so much for your service!',
    urgency: 'routine' as const,
    deliveryWindow: 'Today, 2:00 PM – 4:30 PM',
    coordinates: { lat: 28.5280, lng: -81.3090 }
  }
];

export async function sendMockDeliveryRequestToFirebase(
  customProps?: Partial<DeliveryRequest>
): Promise<{ success: boolean; id: string; request: DeliveryRequest }> {
  const index = Math.floor(Math.random() * MOCK_ORLANDO_RECIPIENTS.length);
  const sample = MOCK_ORLANDO_RECIPIENTS[index];
  const newId = `del_mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const mockPayload: DeliveryRequest = {
    id: newId,
    recipientName: customProps?.recipientName || sample.name,
    phone: customProps?.phone || sample.phone,
    address: customProps?.address || sample.address,
    neighborhood: customProps?.neighborhood || sample.neighborhood,
    householdSize: customProps?.householdSize || sample.householdSize,
    boxType: customProps?.boxType || sample.boxType,
    dietaryRestrictions: customProps?.dietaryRestrictions || sample.dietaryRestrictions,
    safeDropNotes: customProps?.safeDropNotes || sample.safeDropNotes,
    urgency: customProps?.urgency || sample.urgency,
    status: 'pending',
    requestedAt: 'Just now (Firebase Mock)',
    deliveryWindow: sample.deliveryWindow,
    coordinates: sample.coordinates
  };

  const res = await createFirestoreDeliveryRequest(mockPayload);
  return { success: res.success, id: res.id, request: mockPayload };
}

