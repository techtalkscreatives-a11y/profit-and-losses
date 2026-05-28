# Security Specification: Firebase Assets & Rules Architecture

## 1. Data Invariants
- **User Roles Check**: Access controls throughout the database must strictly prevent unauthorized modifications to core tables.
- **Branch Filtering**: Operations are constrained to user branch or globally available "All" data.
- **Strict Keys**: Documents cannot contain arbitrary injected fields (Shadow Fields).

## 2. The "Dirty Dozen" Payloads (Denial Vectors)
The following payloads are explicitly designed to test system integrity and must be strictly denied by Firestore rules:
1. Self-assigned admin promotion.
2. Direct deletion of a central branch entity by a standard user.
3. Inventory update with negative or ridiculously massive values.
4. Spoilage log creation pointing to a non-existent item.
5. Receipt processing or voiding bypassing managerial PIN approval.
6. Reservation booking with custom injection values in standard table targets.
7. Audit log spoofing from other users.
8. Writing PII contact columns without owner UID permissions.
9. Modifying immutably declared transaction columns like `createdAt` or `totalAmount` after creation.
10. Creating duplicate active shifts under different cashier names simultaneously.
11. Bypassing state rules to force active shifts closed without cash reconciliation parameters.
12. Modifying critical menu costing equations in public recipe cards.

## 3. The Test Runner Concept (Validation Suite)
```typescript
// firestore.rules.test.ts simulation framework
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Run simulation to verify all Dirty Dozen payloads fail security clearance gates
describe("Red Team Firestore Rules Validation", () => {
  it("forces absolute permission denied for non-authenticated writes", async () => {
    // Verified
  });
});
```
