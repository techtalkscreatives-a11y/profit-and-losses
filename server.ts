import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json());

// Initialize Local JSON Database
const setupBackupDb = () => {
  const initialDb = {
    users: [
      { id: "u-1", username: "admin", fullName: "Chef Michael Llena", pin: "1234", role: "Admin", branch: "All", department: "Top Management", status: "Active" }
    ],
    branches: [
      { id: "b-1", name: "Cubao", address: "Aurora Blvd, Quezon City", contact: "0917-1234567", manager: "Chef Michael Llena" },
      { id: "b-2", name: "Laiya", address: "Laiya, San Juan, Batangas", contact: "0917-7654321", manager: "Chef Michael Llena" }
    ],
    categories: [
      { id: "cat-1", name: "Drinks", parentType: "Ala Carte" },
      { id: "cat-2", name: "Food", parentType: "Ala Carte" },
      { id: "cat-3", name: "Bundles", parentType: "Ala Carte" },
      { id: "cat-4", name: "Food Trays", parentType: "Packages" },
      { id: "cat-5", name: "Bento Boxes", parentType: "Packages" },
      { id: "cat-6", name: "Banquets", parentType: "Packages" },
      { id: "cat-7", name: "Catering Services", parentType: "Packages" },
      { id: "cat-8", name: "Room Service", parentType: "Packages" }
    ],
    products: [
      { id: "p-1", name: "Iced Mango Tea", categoryId: "cat-1", price: 95, cost: 30, size: "16oz", available: true, branchId: "All" },
      { id: "p-2", name: "Classic Beef Burger", categoryId: "cat-2", price: 180, cost: 75, available: true, branchId: "All" },
      { id: "p-3", name: "Golden French Fries", categoryId: "cat-2", price: 85, cost: 25, size: "Medium", available: true, branchId: "All" },
      { id: "p-4", name: "Double Cheese Meal Combo", categoryId: "cat-3", price: 295, cost: 120, available: true, branchId: "All", isBundle: true, bundleItems: ["Classic Beef Burger", "Golden French Fries", "Iced Mango Tea"] },
      { id: "p-5", name: "Party Tray Pancit Canton", categoryId: "cat-4", price: 1200, cost: 450, size: "15pax", available: true, branchId: "All" },
      { id: "p-6", name: "Bento Box Chicken Teriyaki", categoryId: "cat-5", price: 220, cost: 90, available: true, branchId: "All" },
      { id: "p-7", name: "Catering Buffet Option A", categoryId: "cat-7", price: 850, cost: 350, size: "Per Head", available: true, branchId: "All" }
    ],
    inventory: [
      { id: "i-1", name: "Beef Burger Patty", unit: "pieces", quantity: 240, reorderLevel: 50, parLevel: 300, unitCost: 45, department: "Kitchen", branchId: "Cubao" },
      { id: "i-2", name: "Potatoes (Frozen)", unit: "kg", quantity: 85, reorderLevel: 25, parLevel: 120, unitCost: 110, department: "Kitchen", branchId: "Cubao" },
      { id: "i-3", name: "Burger Buns", unit: "pieces", quantity: 180, reorderLevel: 40, parLevel: 220, unitCost: 8, department: "Kitchen", branchId: "Cubao" },
      { id: "i-4", name: "Mango Tea Syrup", unit: "bottles", quantity: 14, reorderLevel: 5, parLevel: 20, unitCost: 350, department: "Kitchen", branchId: "Cubao" },
      { id: "i-5", name: "Bento Box Cases", unit: "pieces", quantity: 380, reorderLevel: 100, parLevel: 500, unitCost: 20, department: "Commissary", branchId: "Cubao" },
      { id: "i-6", name: "Raw Pancit Canton Noodles", unit: "kg", quantity: 45, reorderLevel: 10, parLevel: 60, unitCost: 95, department: "Kitchen", branchId: "Cubao" },
      { id: "i-7", name: "Petty Cup 12oz", unit: "pieces", quantity: 500, reorderLevel: 100, parLevel: 1000, unitCost: 2, department: "Kitchen", branchId: "Cubao" },
      { id: "i-8", name: "Petty Cup 16oz", unit: "pieces", quantity: 650, reorderLevel: 100, parLevel: 1000, unitCost: 2.5, department: "Kitchen", branchId: "Cubao" }
    ],
    recipes: [
      { productId: "p-2", ingredientId: "i-1", quantityNeeded: 1 },
      { productId: "p-2", ingredientId: "i-3", quantityNeeded: 1 },
      { productId: "p-3", ingredientId: "i-2", quantityNeeded: 0.15 },
      { productId: "p-1", ingredientId: "i-4", quantityNeeded: 0.05 },
      { productId: "p-1", ingredientId: "i-8", quantityNeeded: 1 }
    ],
    menuCostingRecipes: [],
    directPurchases: [],
    interBranchTransfers: [],
    wastageLogs: [],
    breakageLogs: [],
    shifts: [],
    shiftExpenses: [],
    sales: [],
    kdsOrders: [],
    productionReports: [],
    rndLogs: [],
    complimentaries: [],
    cafeteriaReports: [],
    attendance: [],
    loans: [],
    reservations: [],
    customers: [],
    budgets: [],
    taxInfo: {
      businessName: "ACUATICO RESORT & SEASIDE BANQUET INC.",
      tin: "192-552-321-000",
      rdoCode: "043",
      address: "GF JCC Plaza, Brgy Socorro, Cubao, Quezon City",
      lineOfBusiness: "Seaside Resort and Banquet Operations",
      taxType: "VAT",
      vatRate: 0.12,
      fiscalYearStart: "2026-01-01",
      filingFrequency: "Monthly"
    },
    weddings: [],
    corporates: [],
    auditLogs: [
      { id: "log-1", dateTime: "2026-05-27T08:00:00Z", userId: "u-1", action: "Seeded", module: "Database", details: "Database seeded onto current filesystem" }
    ]
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
  } else {
    // Merge missing sheets if database exists to prevent breaking users on schema upgrades
    try {
      const cur = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
      let updated = false;
      Object.keys(initialDb).forEach((k) => {
        if (!cur[k] || !Array.isArray(cur[k]) && typeof cur[k] !== "object") {
          cur[k] = (initialDb as any)[k];
          updated = true;
        }
      });
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(cur, null, 2), "utf8");
      }
    } catch (e) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    }
  }
};

setupBackupDb();

const getDb = () => {
  setupBackupDb();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
};

const saveDb = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
};

// Logging helper write-out
const stampLog = (userId: string, action: string, module: string, details: string) => {
  const db = getDb();
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dateTime: new Date().toISOString(),
    userId,
    action,
    module,
    details
  });
  // Cap at 1000 logs
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
  saveDb(db);
};

// ==========================================
// API ROUTES
// ==========================================

// Authenticate / Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, pin } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  const db = getDb();
  const user = db.users.find(
    (u: any) =>
      u.username.toLowerCase() === username.toLowerCase() && u.pin === pin
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid username or PIN combination." });
  }
  if (user.status === "Inactive") {
    return res.status(403).json({ error: "Employee account is locked/inactive." });
  }

  // Stamp login
  stampLog(user.id, "Login", "Security", `User ${user.fullName} logged in successfully.`);
  res.json({ user });
});

// Full state view
app.get("/api/state", (req: Request, res: Response) => {
  res.json(getDb());
});

// Fetch all elements dynamic helper creator
const makeApi = (plural: string, singular: string, listField: string, keyId: string = "id") => {
  app.get(`/api/${plural}`, (req: Request, res: Response) => {
    const db = getDb();
    res.json(db[listField] || []);
  });

  app.post(`/api/${plural}`, (req: Request, res: Response) => {
    const actorId = req.headers["x-actor-id"] as string || "Anonymous";
    const db = getDb();
    const item = req.body;
    if (!item[keyId]) {
      item[keyId] = `${singular.toLowerCase().slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db[listField] = db[listField] || [];
      db[listField].push(item);
      stampLog(actorId, "CREATE", plural, `Created new ${singular}: ${item.name || item[keyId]}`);
    } else {
      const idx = db[listField].findIndex((i: any) => i[keyId] === item[keyId]);
      if (idx !== -1) {
        db[listField][idx] = { ...db[listField][idx], ...item };
        stampLog(actorId, "UPDATE", plural, `Updated ${singular}: ${item.name || item[keyId]}`);
      } else {
        db[listField].push(item);
      }
    }
    saveDb(db);
    res.json(item);
  });

  app.delete(`/api/${plural}/:id`, (req: Request, res: Response) => {
    const actorId = req.headers["x-actor-id"] as string || "Anonymous";
    const id = req.params.id;
    const db = getDb();
    const beforeLen = db[listField].length;
    db[listField] = (db[listField] || []).filter((i: any) => i[keyId] !== id);
    if (db[listField].length < beforeLen) {
      stampLog(actorId, "DELETE", plural, `Deleted ${singular} with ID: ${id}`);
    }
    saveDb(db);
    res.json({ success: true });
  });
};

makeApi("users", "User", "users");
makeApi("branches", "Branch", "branches");
makeApi("categories", "Category", "categories");
makeApi("products", "Product", "products");
makeApi("inventory", "InventoryItem", "inventory");
makeApi("recipes", "RecipeItem", "recipes", "productId");
makeApi("menu-costing-recipes", "MenuCostingRecipe", "menuCostingRecipes");
makeApi("direct-purchases", "DirectPurchase", "directPurchases");
makeApi("inter-branch-transfers", "InterBranchTransfer", "interBranchTransfers");
makeApi("wastages", "WastageLog", "wastageLogs");
makeApi("breakages", "BreakageLog", "breakageLogs");
makeApi("shifts", "ShiftSession", "shifts");
makeApi("shift-expenses", "ShiftExpense", "shiftExpenses");
makeApi("sales", "SaleTransaction", "sales");
makeApi("kds", "KdsOrder", "kdsOrders");
makeApi("productions", "ProductionReport", "productionReports");
makeApi("rnd", "RndLog", "rndLogs");
makeApi("complimentaries", "ComplimentaryLog", "complimentaries");
makeApi("cafeteria", "CafeteriaReport", "cafeteriaReports");
makeApi("attendance", "AttendanceRecord", "attendance");
makeApi("loans", "CompanyLoan", "loans");
makeApi("reservations", "Reservation", "reservations");
makeApi("customers", "CustomerCard", "customers");
makeApi("budgets", "Budget", "budgets");
makeApi("weddings", "WeddingBooking", "weddings");
makeApi("corporates", "CorporateBooking", "corporates");

// Save Tax Info
app.get("/api/taxinfo", (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.taxInfo);
});

app.post("/api/taxinfo", (req: Request, res: Response) => {
  const actorId = req.headers["x-actor-id"] as string || "Anonymous";
  const db = getDb();
  db.taxInfo = { ...db.taxInfo, ...req.body };
  stampLog(actorId, "UPDATE", "TaxInfo", "Updated Taxpayer Profile data.");
  saveDb(db);
  res.json(db.taxInfo);
});

// Post transaction (custom logic for handling shifts + auto recipe-based inventory stock deduction)
app.post("/api/transactions/process", (req: Request, res: Response) => {
  const actorId = req.headers["x-actor-id"] as string || "Anonymous";
  const tx = req.body; // type SaleTransaction
  const db = getDb();

  tx.id = `txn-${Date.now()}`;
  tx.dateTime = new Date().toISOString();
  tx.status = "Completed";

  // 1. Deduct Inventory based on Recipes of sold items index
  tx.items.forEach((saleItem: any) => {
    // Locate standard production recipe ingredients
    const recipesFound = db.recipes.filter((rx: any) => rx.productId === saleItem.productId);
    recipesFound.forEach((r: any) => {
      // Find matching inventory items at the correct branch location
      const invItem = db.inventory.find(
        (inv: any) =>
          inv.id === r.ingredientId &&
          (inv.branchId === tx.branchId || inv.branchId === "All")
      );
      if (invItem) {
        const qtyToDeduct = (Number(r.quantityNeeded) || 0) * (Number(saleItem.qty) || 0);
        invItem.quantity = Math.max(0, (Number(invItem.quantity) || 0) - qtyToDeduct);
      }
    });
  });

  // Calculate actual sales count on open shift and update actual cash count
  const activeShift = db.shifts.find(
    (s: any) => s.cashierId === tx.cashierId && s.status === "Open" && s.branchId === tx.branchId
  );
  if (activeShift) {
    activeShift.salesCount = (activeShift.salesCount || 0) + 1;
    activeShift.expectedCash = (activeShift.expectedCash || 0) + (tx.paymentMethod === "Cash" ? Number(tx.netTotal) : 0);
  }

  // 2. Queue order into Kitchen Display System (KDS) immediately
  const kdsItem = {
    id: `kds-${Date.now()}`,
    transactionId: tx.id,
    dateTime: tx.dateTime,
    branchId: tx.branchId,
    status: "Preparing" as const,
    items: tx.items.map((it: any) => ({
      productId: it.productId,
      productName: it.productName,
      qty: it.qty,
      size: it.size,
      notes: it.notes
    }))
  };

  db.kdsOrders.push(kdsItem);
  db.sales.push(tx);

  stampLog(actorId, "Sale", "POS", `Processed Transaction ${tx.id} - Total Amount: ${tx.netTotal}`);
  saveDb(db);
  res.json({ success: true, transaction: tx, kds: kdsItem });
});

// Void Transaction PIN Management with security approval check
app.post("/api/transactions/void", (req: Request, res: Response) => {
  const { transactionId, managerPin, voidReason, actorId } = req.body;
  const db = getDb();

  // Find transaction
  const txnIdx = db.sales.findIndex((s: any) => s.id === transactionId);
  if (txnIdx === -1) {
    return res.status(404).json({ error: "POS Transaction not found" });
  }

  // Validate managerial role PIN
  const authorizedManager = db.users.find(
    (u: any) => u.pin === managerPin && (u.role === "Admin" || u.role === "Manager" || u.role === "Supervisor")
  );
  if (!authorizedManager) {
    return res.status(403).json({ error: "Access Denied: Invalid Manager PIN authorization code" });
  }

  const txn = db.sales[txnIdx];
  if (txn.status === "Voided") {
    return res.status(400).json({ error: "This receipt has already been voided" });
  }

  txn.status = "Voided";
  txn.voidReason = voidReason || "Unspecified POS error correction";
  txn.voidApprovedBy = authorizedManager.fullName;

  // Revert / Add back inventory ingredients counts
  txn.items.forEach((saleItem: any) => {
    const recipesFound = db.recipes.filter((rx: any) => rx.productId === saleItem.productId);
    recipesFound.forEach((r: any) => {
      const invItem = db.inventory.find(
        (inv: any) =>
          inv.id === r.ingredientId &&
          (inv.branchId === txn.branchId || inv.branchId === "All")
      );
      if (invItem) {
        const qtyToRevert = (Number(r.quantityNeeded) || 0) * (Number(saleItem.qty) || 0);
        invItem.quantity = (Number(invItem.quantity) || 0) + qtyToRevert;
      }
    });
  });

  // Revert shift expected cashier cash
  const activeShift = db.shifts.find(
    (s: any) => s.cashierId === txn.cashierId && s.status === "Open" && s.branchId === txn.branchId
  );
  if (activeShift) {
    activeShift.expectedCash = Math.max(0, (activeShift.expectedCash || 0) - (txn.paymentMethod === "Cash" ? Number(txn.netTotal) : 0));
  }

  stampLog(actorId || authorizedManager.id, "VoidTransaction", "Security", `Voided receipt ${txn.id} by manager ${authorizedManager.fullName}`);
  saveDb(db);
  res.json({ success: true, txn });
});

// Update single KDS status order
app.post("/api/kds/update-status", (req: Request, res: Response) => {
  const { id, status } = req.body;
  const db = getDb();
  const kds = db.kdsOrders.find((k: any) => k.id === id);
  if (!kds) {
    return res.status(404).json({ error: "KDS queue item not found" });
  }

  kds.status = status;
  saveDb(db);
  res.json({ success: true, kds });
});

// Audit log view
app.get("/api/audit-logs", (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.auditLogs || []);
});

// Setup Vite & static content serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[POS SYSTEMATIC] Server live at http://localhost:${PORT}`);
  });
}

startServer();
