# Security Specification & Test Harness

## 1. Data Invariants
1. **Public Read Integrity**: Pantries and mutual aid fridges are publicly queryable by all community members to prevent access barriers for undocumented or food-insecure families.
2. **Immutable Pantry Identity**: Once created, pantry documents cannot have their `id` or structural metadata tampered with by anonymous clients.
3. **Queue Report Validation**: Queue updates must provide bounded numeric fields (`queueCars` between 0 and 200, `queueWaitMinutes` between 0 and 360) and a valid trend enum (`speeding_up`, `stable`, `slowing_down`).
4. **Delivery Request Integrity**: Delivery requests require mandatory recipient contact fields and default status of `pending`. Status changes (e.g., claiming a drop) are strictly limited to valid lifecycle states: `pending` -> `assigned` -> `in_transit` -> `delivered`.
5. **Driver Identity Check**: Drivers can claim or complete delivery routes when signed in, and cannot overwrite arbitrary delivery record properties.
6. **Volunteer Shift Guarding**: Shifts can be claimed by authenticated community stewards (`spotsClaimed` must be <= `spotsTotal`).

## 2. The "Dirty Dozen" Threat Payloads
1. **Payload 1 (ID Poisoning)**: Path variable `{pantryId}` containing a 2KB buffer overflow or SQL injection payload.
2. **Payload 2 (Ghost Field Attack)**: Queue report write containing arbitrary unverified key `isAdmin: true` or `verifiedBypass: true`.
3. **Payload 3 (Out-of-Bounds Queue Value)**: Queue update with `queueCars: -5` or `queueCars: 9999999`.
4. **Payload 4 (Trend Enum Injection)**: `queueTrend: "malicious_script"` instead of allowed enum.
5. **Payload 5 (Delivery Request State Skip)**: Neighbor request created directly with `status: "delivered"` skipping logistics.
6. **Payload 6 (PII Spoofing)**: Attacker creating a delivery request with someone else's authenticated UID.
7. **Payload 7 (Unbounded Notes Denial-of-Wallet)**: Request with 500KB string in `safeDropNotes` attempting storage exhaustion.
8. **Payload 8 (Shift Overclaim Attack)**: Updating `spotsClaimed` to 100 when `spotsTotal` is 5.
9. **Payload 9 (Terminal State Tampering)**: Modifying a completed delivery (`delivered`) back to `pending`.
10. **Payload 10 (Immutability Bypass)**: Attempting to update `createdAt` timestamp to past or future values.
11. **Payload 11 (Blanket Collection Query Leak)**: Attacker querying collection without security predicates.
12. **Payload 12 (Direct Arbitrary Root Document Write)**: Attempting to write directly to `/{document=**}` catch-all.
