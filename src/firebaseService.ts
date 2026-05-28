import { 
  collection, onSnapshot, doc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, query, where, getDoc, runTransaction 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import initialDb from '../db.json';

// Seeding engine that populates Firestore on first spin-up
export async function seedDatabaseIfNeeded() {
  try {
    const userSnapshot = await getDocs(collection(db, 'users'));
    if (userSnapshot.empty) {
      console.log('[Firebase Seeder]: Seeding Firestore from local db.json template...');
      const collectionsToSeed = [
        { name: 'users', data: initialDb.users, key: 'id' },
        { name: 'branches', data: initialDb.branches, key: 'id' },
        { name: 'categories', data: initialDb.categories, key: 'id' },
        { name: 'products', data: initialDb.products, key: 'id' },
        { name: 'inventory', data: initialDb.inventory, key: 'id' },
        { name: 'recipes', data: initialDb.recipes, key: 'productId' },
        { name: 'menuCostingRecipes', data: (initialDb as any).menuCostingRecipes || [], key: 'id' },
        { name: 'directPurchases', data: (initialDb as any).directPurchases || [], key: 'id' },
        { name: 'interBranchTransfers', data: (initialDb as any).interBranchTransfers || [], key: 'id' },
        { name: 'wastageLogs', data: (initialDb as any).wastageLogs || [], key: 'id' },
        { name: 'breakageLogs', data: (initialDb as any).breakageLogs || [], key: 'id' },
        { name: 'shifts', data: (initialDb as any).shifts || [], key: 'id' },
        { name: 'shiftExpenses', data: (initialDb as any).shiftExpenses || [], key: 'id' },
        { name: 'sales', data: (initialDb as any).sales || [], key: 'id' },
        { name: 'kdsOrders', data: (initialDb as any).kdsOrders || [], key: 'id' },
        { name: 'productionReports', data: (initialDb as any).productionReports || [], key: 'id' },
        { name: 'rndLogs', data: (initialDb as any).rndLogs || [], key: 'id' },
        { name: 'complimentaries', data: (initialDb as any).complimentaries || [], key: 'id' },
        { name: 'cafeteriaReports', data: (initialDb as any).cafeteriaReports || [], key: 'id' },
        { name: 'attendance', data: (initialDb as any).attendance || [], key: 'id' },
        { name: 'loans', data: (initialDb as any).loans || [], key: 'id' },
        { name: 'reservations', data: (initialDb as any).reservations || [], key: 'id' },
        { name: 'customers', data: (initialDb as any).customers || [], key: 'id' },
        { name: 'budgets', data: (initialDb as any).budgets || [], key: 'id' },
        { name: 'weddings', data: (initialDb as any).weddings || [], key: 'id' },
        { name: 'corporates', data: (initialDb as any).corporates || [], key: 'id' },
        { name: 'auditLogs', data: (initialDb as any).auditLogs || [], key: 'id' }
      ];

      for (const col of collectionsToSeed) {
        if (!col.data || col.data.length === 0) continue;
        for (const item of col.data) {
          let docId = item[col.key];
          if (!docId) {
            docId = `${col.name.slice(0, 3)}-${Math.random().toString(36).slice(2, 8)}`;
          }
          if (col.name === 'recipes') {
            docId = `${item.productId}_${item.ingredientId}`;
          }
          await setDoc(doc(db, col.name, docId), item);
        }
      }

      // Also seed taxInfo standard document config
      await setDoc(doc(db, 'systemConfig', 'taxInfo'), initialDb.taxInfo);
      console.log('[Firebase Seeder]: Seeding of operational collections succeeded!');
    }
  } catch (error) {
    console.error('[Firebase Seeder]: Seeding database encountered error: ', error);
  }
}

// Global audit logging trace write helper
export async function stampAuditLog(userId: string, action: string, module: string, details: string) {
  const logId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const auditLogObj = {
    id: logId,
    dateTime: new Date().toISOString(),
    userId,
    action,
    module,
    details
  };
  try {
    await setDoc(doc(db, 'auditLogs', logId), auditLogObj);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `auditLogs/${logId}`);
  }
}

// Standard Firestore collection map matching old plural endpoint name conversions
export const ENDPOINT_COLLECTION_MAP: Record<string, string> = {
  'users': 'users',
  'branches': 'branches',
  'categories': 'categories',
  'products': 'products',
  'inventory': 'inventory',
  'recipes': 'recipes',
  'menu-costing-recipes': 'menuCostingRecipes',
  'direct-purchases': 'directPurchases',
  'inter-branch-transfers': 'interBranchTransfers',
  'wastages': 'wastageLogs',
  'breakages': 'breakageLogs',
  'shifts': 'shifts',
  'shift-expenses': 'shiftExpenses',
  'sales': 'sales',
  'kds': 'kdsOrders',
  'productions': 'productionReports',
  'rnd': 'rndLogs',
  'complimentaries': 'complimentaries',
  'cafeteria': 'cafeteriaReports',
  'attendance': 'attendance',
  'loans': 'loans',
  'reservations': 'reservations',
  'customers': 'customers',
  'budgets': 'budgets',
  'weddings': 'weddings',
  'corporates': 'corporates'
};
