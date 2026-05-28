export type UserRole = 'Admin' | 'Cashier' | 'Manager' | 'Supervisor' | 'Head Chef' | 'HR Admin';

export interface User {
  id: string;
  username: string;
  fullName: string;
  pin: string;
  role: UserRole;
  branch: string; // e.g. "Cubao", "Manila", "All"
  department?: string;
  status: 'Active' | 'Inactive';
  modules?: string[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  contact: string;
  manager: string;
}

export interface Category {
  id: string;
  name: string; // e.g. "Drinks", "Food", "Bundles", "Food Trays", "Bento Boxes", "Banquets", "Catering Services", "In Room Dining", "Room Service"
  parentType: 'Ala Carte' | 'Packages';
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  size?: string; // e.g. "12oz", "16oz"
  available: boolean;
  branchId: string; // "All" or specific branch ID
  isBundle?: boolean;
  bundleItems?: string[]; // list of product names
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  parLevel: number;
  unitCost: number;
  department: string; // FnB, Kitchen, Commissary, Housekeeping, Engineering, HR, etc.
  branchId: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantityNeeded: number; // raw amount per product unit
}

export interface MenuCostingRecipe {
  id: string;
  name: string;
  recipeCode: string;
  category: string;
  yieldPax: number;
  portionSize: string;
  meatWeight: number; // in grams
  vegWeight: number; // in grams
  sauceWeight: number; // in grams
  shrinkagePct: number;
  prepTime: string;
  cookingTime: string;
  procedure: string;
  laborCost30: number; // 30% of total
  opex30: number; // 30% of total
  vat12: number;
  cogs: number;
  foodCost: number;
  foodCostPercentage: number;
  profit: number;
  recommendedPrice: number;
  finalPrice: number;
  ingredients: {
    ingredientId: string;
    weightStandard: number; // grams or standard qty
    weightActual: number;
    unitPrice: number;
    recoveryPct: number;
    desc?: string;
    weightCatering?: number;
    actualPurchase?: string;
  }[];
  allergens: string[]; // ['Gluten', 'Soybeans', 'Sesame', etc.]
  equipments: string[]; // list of tools/equipments
  photoUrl?: string;
  
  // Custom Excel spreadsheet optional fields added to match form screenshots
  typeOfEvent?: string;
  classification?: string;
  recipeType?: string;
  dateCreated?: string;
  estSellingPrice?: number;
  batchActualCooked?: number;
  weightInRaw?: number;
  weightPerPortion?: number;
  shrinkageGrams?: number;
  prepTemp?: string;
  cookingTemp?: string;
  coolingTime?: string;
  coolingTemp?: string;
  reheatingTime?: string;
  reheatingTemp?: string;
  dryStrgActive?: boolean;
  dryStrgTemp?: string;
  chillerActive?: boolean;
  chillerTemp?: string;
  roomTpActive?: boolean;
  roomTpTemp?: string;
  freezerActive?: boolean;
  freezerTemp?: string;
  nutritionFacts?: {
    servingSize?: string;
    servingsPerContainer?: string;
    amountPerServing?: string;
    calories?: string;
    totalFat?: string;
    saturatedFat?: string;
    transfat?: string;
    carbohydrates?: string;
    dietaryFiber?: string;
    sugars?: string;
    addedSugars?: string;
    protein?: string;
    sodium?: string;
    calcium?: string;
    iron?: string;
  };
  equipments10?: string[];
  signatoryChef?: string;
  signatoryChefPos?: string;
  signatoryApproved1?: string;
  signatoryApproved1Pos?: string;
  signatoryApproved2?: string;
  signatoryApproved2Pos?: string;
}

export interface DirectPurchase {
  id: string;
  date: string;
  dateTime: string;
  supplierName: string;
  supplierBrand: string;
  contactInfo: string;
  address: string;
  tin: string;
  orSiNo: string;
  pcvNo: string; // Petty Cash Voucher No
  department: string; // FnB, Kitchen, Housekeeping, etc.
  branchId: string;
  items: {
    name: string;
    qty: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Received';
}

export interface InterBranchTransfer {
  id: string;
  date: string;
  senderBranchId: string;
  receiverBranchId: string;
  department: string;
  ingredientId: string;
  quantity: number;
  value: number;
  status: 'Pending' | 'Approved';
}

export interface WastageLog {
  id: string;
  date: string;
  branchId: string;
  department: string;
  ingredientId: string;
  qtyWasted: number;
  unit: string;
  cost: number;
  wasteType: 'Spoilage' | 'Wastage' | 'Expired';
  reason: string;
}

export interface BreakageLog {
  id: string;
  date: string;
  branchId: string;
  department: string;
  equipmentName: string;
  qtyBroken: number;
  cost: number;
  reason: string;
}

export interface ShiftSession {
  id: string;
  cashierId: string;
  branchId: string;
  startTime: string;
  endTime?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  variance?: number; // closing - expected
  expensesLogged: number;
  salesCount: number;
  status: 'Open' | 'Closed';
}

export interface ShiftExpense {
  id: string;
  shiftId: string;
  amount: number;
  description: string;
}

export interface SaleTransaction {
  id: string;
  dateTime: string;
  branchId: string;
  cashierId: string;
  customerName?: string;
  items: {
    productId: string;
    productName: string;
    qty: number;
    price: number;
    size?: string;
    notes?: string;
  }[];
  paymentMethod: 'Cash' | 'GCash' | 'PayMaya';
  refNumber?: string;
  subtotal: number;
  tax: number; // VAT
  discount: number; // PWD/Senior or general
  paxEligible: number;
  totalPax: number;
  netTotal: number;
  amountPaid: number;
  change: number;
  status: 'Completed' | 'Voided';
  voidReason?: string;
  voidApprovedBy?: string;
  packageType?: string; // "Ala Carte" | "Food Trays" | "Bento Boxes" | "Catering Services"
}

export interface KdsOrder {
  id: string;
  transactionId: string;
  dateTime: string;
  branchId: string;
  status: 'Preparing' | 'Ready' | 'Completed';
  items: {
    productId: string;
    productName: string;
    qty: number;
    size?: string;
    notes?: string;
  }[];
}

export interface ProductionReport {
  id: string;
  date: string;
  recipeId: string;
  paxCount: number;
  totalCost: number;
  type: 'Commissary' | 'Catering' | 'Ala Carte';
}

export interface RndLog {
  id: string;
  date: string;
  menuName: string;
  ingredientsUsed: {
    ingredientId: string;
    quantity: number;
    cost: number;
  }[];
  totalCost: number;
  findings: string;
}

export interface ComplimentaryLog {
  id: string;
  date: string;
  department: string;
  itemName: string;
  qty: number;
  value: number;
  notes: string;
}

export interface CafeteriaReport {
  id: string;
  date: string;
  mealName: string;
  paxServed: number;
  totalCost: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  hoursWorked: number;
  overtimeHours: number;
  loansDeducted: number;
  bonusHoliday: number;
  notes?: string;
}

export interface CompanyLoan {
  id: string;
  userId: string;
  amount: number;
  monthlyDeduction: number;
  balance: number;
  status: 'Active' | 'Paid';
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  guestCount: number;
  pwdAlert: boolean;
  seniorAlert: boolean;
  allergens: string;
  tableNo: string;
  area: string; // Main Hall, Garden, Room Service, etc.
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  notes?: string;
  advanceOrderType?: 'Dine In' | 'Take Out';
  advanceOrderNotes?: string;
}

export interface CustomerCard {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  visits: number;
  spend: number;
  loyaltyCode: string;
}

export interface Budget {
  id: string;
  year: number;
  month: number; // 1 - 12
  department: string;
  plannedAmount: number;
  actualAmount: number;
}

export interface TaxInfo {
  businessName: string;
  tin: string;
  rdoCode: string;
  address: string;
  lineOfBusiness: string;
  taxType: 'VAT' | 'Non-VAT';
  vatRate: number; // e.g. 0.12 (12%)
  fiscalYearStart: string; // e.g. "2026-01-01"
  filingFrequency: 'Monthly' | 'Quarterly';
}

export interface WeddingBooking {
  id: string;
  coupleNames: string;
  date: string;
  pax: number;
  motif: string;
  floralArrangements: string;
  cakeDetails: string;
  ceremonySetup: string;
  appetizer: string;
  soup: string;
  saladBar: string;
  breadStation: string;
  mainCourses: string[];
  dessert: string;
  beverages: string;
  remarks: string;
  signatories: {
    eventPlanner: string;
    chef: string;
    client: string;
  };

  // Villa Escudero Wedding optional details
  status?: string;
  dateDetailing?: string;
  phoneNo?: string;
  emailAddress?: string;
  representative?: string;
  venue?: string;
  timeline?: {
    date: string;
    time: string;
    venue: string;
    event: string;
    going: string;
    remarks: string;
  }[];
  pastaOrNoodles?: string;
  riceStation?: string;
  vegetable?: string;
  fishAndSeafood?: string;
  chickenStation?: string;
  porkStation?: string;
  beefStation?: string;
  additionalKakanin?: string;
  choiceOfGrazingTable?: string;
  crewPackedMeal?: {
    period: string; // BREAKFAST, LUNCH, DINNER, KIDDIE MEAL
    packedMeal: string;
    pax: number;
    time: string;
    venue: string;
  }[];
  weddingPackageSpecs?: string;
  floralServicesSpecs?: string;

  // Venue setup/Other amenities
  setupTheme?: string;
  setupMotif?: string;
  setupGuestTableFlower?: string;
  setupGuestTableEquipment?: string;
  setupGuestTableLinen?: string;
  setupVIPTableFlowers?: string;
  setupVIPTableEquipment?: string;
  setupVIPTableLinen?: string;
  setupVIPTableNotes?: string;
  setupBuffetTableLinen?: string;
  setupBuffetTableCount?: string;
  setupBackdropBackground?: string;
  setupBackdropStage?: string;
  setupChairs?: string;
  setupTunnelEntrance?: string;
  setupDanceFloorDesign?: string;

  ceremonySetupList?: string[];
  specialInstructions?: string;

  // Additional signatories from photograph
  signatoryAsstFDManager?: string;
  signatoryHousekeeping?: string;
  signatoryGSDDept?: string;
  signatoryBanquetDept?: string;
  signatoryPurchasingManager?: string;
  signatoryShop?: string;
}

export interface CorporateBooking {
  id: string;
  companyName: string;
  eventTitle: string;
  venue: string;
  date: string;
  pax: number;
  contactPerson: string;
  contactMobile: string;
  email: string;
  contractPrice: number;
  mealProgram: {
    date: string;
    mealPeriod: string; // "AM Snack", "Lunch", "PM Snack", "Dinner", "Breakfast"
    typeOfService: string; // "Plated", "Buffet", "Packed"
    paxCount: number;
    ratePerHead: number;
    time: string;
    venue?: string;
  }[];
  signatories: {
    manager: string;
    chef: string;
    client: string;
  };

  // Acuatico Banquet Event Order details from photograph
  beoNo?: string;
  preparedBy?: string;
  datePrepared?: string;
  checkInDate?: string;
  checkOutDate?: string;
  eta?: string;
  etd?: string;
  adultsCount?: number;
  kidsCount?: number;
  guestProfile?: string;
  frontOfficeInstructions?: string;
  importantNotesVIP?: string;
  signagesText?: string;
  
  // Finance particulars from Acuatico sheet
  financialParticulars?: {
    particular: string; // "Room Revenue", "Meal", etc.
    phpAmount: number;
    remarks: string;
  }[];
  totalPaidAmount?: number;
  billingArrangementCorp?: string;

  itEngineeringInstructions?: string;
  housekeepingSpecialInstructions?: string;
  securityInstructions?: string;

  menuChefDiscretionText?: string;
  fbArrangementInstructions?: string;
  suppliersText?: string;
  functionRoomText?: string;
  programText?: string;
}
