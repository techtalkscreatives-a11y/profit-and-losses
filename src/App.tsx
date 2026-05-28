import React, { useState, useEffect } from 'react';
import { 
  User, UserRole, Branch, Category, Product, InventoryItem, 
  DirectPurchase, InterBranchTransfer, WastageLog, BreakageLog, 
  ShiftSession, SaleTransaction, KdsOrder, ProductionReport, 
  RndLog, ComplimentaryLog, CafeteriaReport, AttendanceRecord, 
  CompanyLoan, Reservation, CustomerCard, Budget, TaxInfo, 
  WeddingBooking, CorporateBooking, MenuCostingRecipe
} from './types';
import { formatMoney, formatDate, formatJustDate, getMonthName } from './utils';
import { RecipeCostingComponent } from './components/RecipeCosting';
import { BIRFormsComponent } from './components/BIRForms';
import { EventModulesComponent } from './components/EventModules';
import { UserManagementComponent } from './components/UserManagement';
import { InventoryManagerComponent } from './components/InventoryManager';
import { ProcurementManagerComponent } from './components/ProcurementManager';
import { CommissaryProductionComponent } from './components/CommissaryProduction';
import { BudgetAndPnLReportsComponent } from './components/BudgetAndPnLReports';
import { ReservationSystemComponent } from './components/ReservationSystem';
import { CustomerLoyaltyComponent } from './components/CustomerLoyalty';

// Firebase core integrations
import { 
  collection, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { seedDatabaseIfNeeded, stampAuditLog, ENDPOINT_COLLECTION_MAP } from './firebaseService';

// Language text pack for the application
const I18N_DICTS: Record<string, Record<string, string>> = {
  en: {
    brandName: "JCC Management Operations",
    opsTerminal: "System Operations Terminal",
    search: "Search...",
    dashboard: "Dashboard Matrix",
    pos: "POS Sale Interface",
    kds: "KDS Kitchen Interface",
    shifts: "Shift & Drawer",
    inventory: "Master Stock Ledger",
    procurement: "Procurement & POs",
    wastage: "Waste & Spoilage Log",
    breakage: "Breakage Log",
    productionHub: "Commissary Production / R&D",
    staffAttendance: "Attendance & Loans",
    reservations: "Table reservations",
    birCompliance: "BIR & Tax Compliance",
    weddingBanq: "Wedding Banquet Packages",
    corpTeam: "Corporate Outing Specs",
    privacySafety: "System Privacy & Security",
    lowStockNotice: "Low Stock Alert Monitor",
    vipTitle: "VIP Operations Hub - Verified Signatory",
    posSummary: "POS SUMMARY",
    voidRequest: "VOID REQUEST",
    stockTransfer: "STOCK TRANSFER",
    serverOnline: "SERVER: ONLINE (ASIA-PH-1)",
    version: "VERSION: 4.2.1-JCC",
    devOwner: "Developer & Owner: JCC Management under Chef Michael Llena",
    selectLang: "Select Language / Select Translation",
  },
  zh: {
    brandName: "JCC 运营管理系统",
    opsTerminal: "系统操作终端",
    search: "搜索...",
    dashboard: "核心仪表盘数据",
    pos: "POS 收银销售终端",
    kds: "KDS 厨房显示系统",
    shifts: "交班与现金抽屉",
    inventory: "主库存账册",
    procurement: "直采与采购申请",
    wastage: "损耗与过期记录",
    breakage: "餐具破损记录",
    productionHub: "中央厨房生产与研发",
    staffAttendance: "考勤与员工贷款",
    reservations: "桌位预订与日历",
    birCompliance: "BIR 国家税务申报",
    weddingBanq: "婚宴专包预订",
    corpTeam: "企业团建与会议程序",
    privacySafety: "系统私密性锁屏",
    lowStockNotice: "低库存警戒提醒",
    vipTitle: "VIP 签约高密特区",
    posSummary: "销售汇总",
    voidRequest: "退货申请",
    stockTransfer: "库房调拔",
    serverOnline: "云端服务器: 联机正常",
    version: "版本号: 4.2.1-JCC",
    devOwner: "系统所有权: JCC Management 隶属 Chef Michael Llena 专管",
    selectLang: "选择语言",
  },
  es: {
    brandName: "JCC Gestión de Operaciones",
    opsTerminal: "Terminal del Sistema",
    search: "Buscar...",
    dashboard: "Matriz del Panel",
    pos: "Interfaz POS",
    kds: "Pantalla KDS",
    shifts: "Turnos y Caja Fuerte",
    inventory: "Inventario General",
    procurement: "Compras Directas",
    wastage: "Log de Mermas",
    breakage: "Roturas de Vajilla",
    productionHub: "Producción / I+D",
    staffAttendance: "Asistencia y Préstamos",
    reservations: "Reservaciones",
    birCompliance: "Cumplimiento BIR",
    weddingBanq: "Paquetes Boda",
    corpTeam: "Salidas Corporativas",
    privacySafety: "Privacidad Lock-out",
    lowStockNotice: "Falta de stock",
    vipTitle: "VIP Autorización",
    posSummary: "RESUMEN POS",
    voidRequest: "VOID RECIBO",
    stockTransfer: "TRANSFERENCIA",
    serverOnline: "SOPORTE: ONLINE (ASIA-PH-1)",
    version: "VERSIÓN: 4.2.1-JCC",
    devOwner: "Titularidad: JCC Management - Chef Michael Llena",
    selectLang: "Idioma",
  },
  fil: {
    brandName: "JCC Pamamahala ng Operations",
    opsTerminal: "System Operations Terminal",
    search: "Maghanap...",
    dashboard: "Dashboard Matrix",
    pos: "POS Interface ng Benta",
    kds: "KDS Interface ng Kusina",
    shifts: "Shift at Cash Drawer",
    inventory: "Imbentaryo ng Stocks",
    procurement: "Direktang Pagbili & Request",
    wastage: "Log ng Wastage & Spoilage",
    breakage: "Log ng Basag na Plato",
    productionHub: "Commissary Production / R&D",
    staffAttendance: "Attendance at Loans",
    reservations: "Reservations ng Mesa",
    birCompliance: "BIR at Pagsunod sa Buwis",
    weddingBanq: "Pakete sa Kasal",
    corpTeam: "Corporate Outing Specs",
    privacySafety: "Privacy ng System at Locks",
    lowStockNotice: "Babala sa Ubos na Stock",
    vipTitle: "VIP Operations Hub - Pinirmahang Awtorisasyon",
    posSummary: "BUOD NG POS",
    voidRequest: "VOID NA RESIBO",
    stockTransfer: "TRANSFER NG STOCK",
    serverOnline: "SERVER: ONLINE (ASIA-PH-1)",
    version: "VERSION: 4.2.1-JCC",
    devOwner: "Developer at May-ari: JCC Management sa pamumuno ni Chef Michael Llena",
    selectLang: "Pumili ng Wika",
  },
  ar: {
    brandName: "JCC لإدارة العمليات",
    opsTerminal: "محطة تشغيل النظام",
    search: "بحث...",
    dashboard: "لوحة التحكم الرئيسية",
    pos: "نقطة البيع POS",
    kds: "شاشة المطبخ KDS",
    shifts: "الوردية والدرج",
    inventory: "دفتر المخزون العام",
    procurement: "المشتريات المباشرة",
    wastage: "سجل الهدر والتالف",
    breakage: "سجل كسر الأدوات",
    productionHub: "المطبخ المركزي والبحث",
    staffAttendance: "الحضور والقروض",
    reservations: "حجوزات الطاولات",
    birCompliance: "الضرائب والامتثال BIR",
    weddingBanq: "باقات الزفاف",
    corpTeam: "البرامج والرحلات للشركات",
    privacySafety: "الخصوصية وقفل النظام",
    lowStockNotice: "تنبيه نقص المخزون",
    vipTitle: "VIP توقيع معتمد",
    posSummary: "ملخص المبيعات",
    voidRequest: "طلب إلغاء فاتورة",
    stockTransfer: "نقل المخزون",
    serverOnline: "الخادم: متصل وآمن",
    version: "الإصدار: 4.2.1-JCC",
    devOwner: "المطور والمالك: JCC تحت إدارة الشيف مايكل لينا",
    selectLang: "اختر اللغة",
  }
};

export default function App() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPin, setLoginPin] = useState('1234');
  const [loginError, setLoginError] = useState('');
  
  // App General State
  const [language, setLanguage] = useState<'en' | 'zh' | 'es' | 'fil' | 'ar'>('en');
  const [activeBranch, setActiveBranch] = useState<string>('Cubao'); 
  const [activeView, setActiveView] = useState<string>('dashboard');
  
  // DB States retrieved via fetch
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [menuCostingRecipes, setMenuCostingRecipes] = useState<MenuCostingRecipe[]>([]);
  const [directPurchases, setDirectPurchases] = useState<DirectPurchase[]>([]);
  const [transfers, setTransfers] = useState<InterBranchTransfer[]>([]);
  const [wastages, setWastages] = useState<WastageLog[]>([]);
  const [breakages, setBreakages] = useState<BreakageLog[]>([]);
  const [shifts, setShifts] = useState<ShiftSession[]>([]);
  const [shiftExpenses, setShiftExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [kdsOrders, setKdsOrders] = useState<KdsOrder[]>([]);
  const [productions, setProductions] = useState<ProductionReport[]>([]);
  const [rndLogs, setRndLogs] = useState<RndLog[]>([]);
  const [complimentaries, setComplimentaries] = useState<any[]>([]);
  const [cafeteria, setCafeteria] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [weddings, setWeddings] = useState<WeddingBooking[]>([]);
  const [corporates, setCorporateBookings] = useState<any[]>([]);
  const [taxInfo, setTaxInfo] = useState<TaxInfo>({
    businessName: '', tin: '', rdoCode: '', address: '', lineOfBusiness: '', taxType: 'VAT', vatRate: 0.12, fiscalYearStart: '', filingFrequency: 'Monthly'
  });

  // Current Operations state (POS Cart, Shift Drawer, Modals)
  const [cart, setCart] = useState<{ product: Product; qty: number; size: '12oz' | '16oz' | 'Regular'; notes: string }[]>([]);
  const [posCategory, setPosCategory] = useState<string>('all');
  const [posPackageType, setPosPackageType] = useState<'All' | 'Ala Carte' | 'Food Trays' | 'Bento Boxes' | 'Banquets' | 'Catering Services' | 'In Room Dining' | 'Room Service'>('All');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'PayMaya'>('Cash');
  const [paxTotalCount, setPaxTotalCount] = useState(1);
  const [paxEligibleDiscount, setPaxEligibleDiscount] = useState(0); // Senior / PWD eligible counts
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentRefNo, setPaymentRefNo] = useState('');
  const [activeShift, setActiveShift] = useState<ShiftSession | null>(null);

  // HR sub-tab system state
  const [attendanceSubTab, setAttendanceSubTab] = useState<'attendance' | 'employees'>('attendance');

  // Reservation Form & Dialog modal state variables (avoiding prompt blocker)
  const [addBookingModalOpen, setAddBookingModalOpen] = useState(false);
  const [newBookingName, setNewBookingName] = useState('Maria Clara');
  const [newBookingDate, setNewBookingDate] = useState('2026-05-28');
  const [newBookingTable, setNewBookingTable] = useState('B Banquet 1');
  const [newBookingTime, setNewBookingTime] = useState('18:00');
  const [newBookingPhone, setNewBookingPhone] = useState('09151234455');
  const [newBookingCount, setNewBookingCount] = useState(10);
  const [newBookingPwd, setNewBookingPwd] = useState(false);
  const [newBookingSenior, setNewBookingSenior] = useState(true);
  const [newBookingAllergens, setNewBookingAllergens] = useState('Shellfish');
  const [newBookingArea, setNewBookingArea] = useState('Garden');
  const [newBookingStatus, setNewBookingStatus] = useState<'Pending' | 'Confirmed' | 'Completed'>('Confirmed');
  const [openingCashInput, setOpeningCashInput] = useState('5000');

  // Customer Loyalty selection in POS
  const [selectedLoyaltyCustId, setSelectedLoyaltyCustId] = useState<string>('');
  const [closingCashInput, setClosingCashInput] = useState('');
  
  // Procurement input states
  const [selectedSupplier, setSelectedSupplier] = useState('Baguio Agri Foods Corp');
  const [siNo, setSiNo] = useState('');
  const [pcvNoInput, setPcvNoInput] = useState('');
  const [directPurchaseItems, setDirectPurchaseItems] = useState<{ name: string; qty: number; unit: string; unitPrice: number }[]>([
    { name: '', qty: 10, unit: 'kg', unitPrice: 100 }
  ]);
  const [procurementDept, setProcurementDept] = useState('Kitchen');

  // Void request Modal states
  const [voidTxnId, setVoidTxnId] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [voidManagerPin, setVoidManagerPin] = useState('');
  const [voidModalOpen, setVoidModalOpen] = useState(false);

  // Z-Reading Modal State
  const [zReadingShift, setZReadingShift] = useState<ShiftSession | null>(null);

  // Lock status (Chef Michael Llena Master Lock parameter)
  const [systemLocked, setSystemLocked] = useState(false);
  const [lockPinInput, setLockPinInput] = useState('');

  // 1. Fetch entire database from backing API
  const refreshState = async () => {
    // Left as dummy for backward compatibility since state streams in real-time via onSnapshot
  };

  // Run initial state setup and real-time synchronizations on boot
  useEffect(() => {
    const runSetupAndSub = async () => {
      await seedDatabaseIfNeeded();
    };
    runSetupAndSub();

    const unsubscribes = [
      onSnapshot(collection(db, 'users'), (snap) => {
        const list: User[] = [];
        snap.forEach((d) => list.push(d.data() as User));
        setUsers(list);
      }),
      onSnapshot(collection(db, 'branches'), (snap) => {
        const list: Branch[] = [];
        snap.forEach((d) => list.push(d.data() as Branch));
        setBranches(list);
      }),
      onSnapshot(collection(db, 'categories'), (snap) => {
        const list: Category[] = [];
        snap.forEach((d) => list.push(d.data() as Category));
        setCategories(list);
      }),
      onSnapshot(collection(db, 'products'), (snap) => {
        const list: Product[] = [];
        snap.forEach((d) => list.push(d.data() as Product));
        setProducts(list);
      }),
      onSnapshot(collection(db, 'inventory'), (snap) => {
        const list: InventoryItem[] = [];
        snap.forEach((d) => list.push(d.data() as InventoryItem));
        setInventory(list);
      }),
      onSnapshot(collection(db, 'recipes'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setRecipes(list);
      }),
      onSnapshot(collection(db, 'menuCostingRecipes'), (snap) => {
        const list: MenuCostingRecipe[] = [];
        snap.forEach((d) => list.push(d.data() as MenuCostingRecipe));
        setMenuCostingRecipes(list);
      }),
      onSnapshot(collection(db, 'directPurchases'), (snap) => {
        const list: DirectPurchase[] = [];
        snap.forEach((d) => list.push(d.data() as DirectPurchase));
        setDirectPurchases(list);
      }),
      onSnapshot(collection(db, 'interBranchTransfers'), (snap) => {
        const list: InterBranchTransfer[] = [];
        snap.forEach((d) => list.push(d.data() as InterBranchTransfer));
        setTransfers(list);
      }),
      onSnapshot(collection(db, 'wastageLogs'), (snap) => {
        const list: WastageLog[] = [];
        snap.forEach((d) => list.push(d.data() as WastageLog));
        setWastages(list);
      }),
      onSnapshot(collection(db, 'breakageLogs'), (snap) => {
        const list: BreakageLog[] = [];
        snap.forEach((d) => list.push(d.data() as BreakageLog));
        setBreakages(list);
      }),
      onSnapshot(collection(db, 'shifts'), (snap) => {
        const list: ShiftSession[] = [];
        snap.forEach((d) => list.push(d.data() as ShiftSession));
        setShifts(list);
      }),
      onSnapshot(collection(db, 'shiftExpenses'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setShiftExpenses(list);
      }),
      onSnapshot(collection(db, 'sales'), (snap) => {
        const list: SaleTransaction[] = [];
        snap.forEach((d) => list.push(d.data() as SaleTransaction));
        setSales(list);
      }),
      onSnapshot(collection(db, 'kdsOrders'), (snap) => {
        const list: KdsOrder[] = [];
        snap.forEach((d) => list.push(d.data() as KdsOrder));
        setKdsOrders(list);
      }),
      onSnapshot(collection(db, 'productionReports'), (snap) => {
        const list: ProductionReport[] = [];
        snap.forEach((d) => list.push(d.data() as ProductionReport));
        setProductions(list);
      }),
      onSnapshot(collection(db, 'rndLogs'), (snap) => {
        const list: RndLog[] = [];
        snap.forEach((d) => list.push(d.data() as RndLog));
        setRndLogs(list);
      }),
      onSnapshot(collection(db, 'complimentaries'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setComplimentaries(list);
      }),
      onSnapshot(collection(db, 'cafeteriaReports'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setCafeteria(list);
      }),
      onSnapshot(collection(db, 'attendance'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setAttendance(list);
      }),
      onSnapshot(collection(db, 'loans'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setLoans(list);
      }),
      onSnapshot(collection(db, 'reservations'), (snap) => {
        const list: Reservation[] = [];
        snap.forEach((d) => list.push(d.data() as Reservation));
        setReservations(list);
      }),
      onSnapshot(collection(db, 'customers'), (snap) => {
        const list: CustomerCard[] = [];
        snap.forEach((d) => list.push(d.data() as CustomerCard));
        setCustomers(list);
      }),
      onSnapshot(collection(db, 'budgets'), (snap) => {
        const list: Budget[] = [];
        snap.forEach((d) => list.push(d.data() as Budget));
        setBudgets(list);
      }),
      onSnapshot(collection(db, 'weddings'), (snap) => {
        const list: WeddingBooking[] = [];
        snap.forEach((d) => list.push(d.data() as WeddingBooking));
        setWeddings(list);
      }),
      onSnapshot(collection(db, 'corporates'), (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setCorporateBookings(list);
      }),
      onSnapshot(doc(db, 'systemConfig', 'taxInfo'), (snap) => {
        if (snap.exists()) {
          setTaxInfo(snap.data() as TaxInfo);
        }
      })
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Sync the activeShift state based on logged in user and branch
  useEffect(() => {
    if (currentUser && shifts.length > 0) {
      const foundActive = shifts.find(
        (s) => s.cashierId === currentUser.username && s.status === 'Open' && s.branchId === activeBranch
      );
      setActiveShift(foundActive || null);
    } else {
      setActiveShift(null);
    }
  }, [currentUser, activeBranch, shifts]);

  // Prevent HR Admin from being stuck on dashboard
  useEffect(() => {
    if (currentUser?.role === 'HR Admin' && activeView === 'dashboard') {
      setActiveView('attendance');
    }
  }, [currentUser, activeView]);

  // Handle Logins
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const matched = users.find(
        (u) => u.username.toLowerCase() === loginUsername.toLowerCase() && u.pin === loginPin
      );
      if (!matched) {
        setLoginError("Invalid username or PIN combination.");
        return;
      }
      if (matched.status === 'Inactive') {
        setLoginError("Employee account is locked/inactive.");
        return;
      }
      setCurrentUser(matched);
      if (matched.branch !== 'All') {
        setActiveBranch(matched.branch);
      }
      await stampAuditLog(matched.id, "Login", "Security", `User ${matched.fullName} logged in successfully via Firestore.`);
    } catch (error) {
      setLoginError("Failed to authenticate to backend database");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]);
    setActiveShift(null);
  };

  // Helper translations dispatch
  const lex = (key: string) => {
    const dict = I18N_DICTS[language] || I18N_DICTS['en'];
    return dict[key] || I18N_DICTS['en'][key] || key;
  };

  // Role based access logic verification helper
  // Admin: all. Cashier: POS, Reservations, Complimentary, Customers, Shift and cash.
  // Manager/Supervisor: POS, Reservations, Complimentary, Customers, Shift and cash, Void, Sales report, Waste, Breakage, Inventory.
  // Head Chef: Complimentary, R&D, Production, Recipe directory, Cafeteria, Waste, Breakage, Inventory.
  // HR Admin: Payroll/Attendance, Users list.
  const hasAccess = (view: string) => {
    if (!currentUser) return false;
    const r = currentUser.role;
    if (r === 'Admin') return true;
    
    // Custom fine-grained module access defined by the administrator
    if (currentUser.modules && Array.isArray(currentUser.modules)) {
      return currentUser.modules.includes(view);
    }
    
    if (r === 'Cashier') {
      return ['pos', 'reservations', 'complimentary', 'customers', 'shifts'].includes(view);
    }
    if (r === 'Manager' || r === 'Supervisor') {
      return ['pos', 'reservations', 'complimentary', 'customers', 'shifts', 'reports', 'inventory', 'wastage', 'breakage', 'procurement'].includes(view);
    }
    if (r === 'Head Chef') {
      return ['production', 'recipes', 'rnd', 'cafeteria', 'complimentary', 'wastage', 'breakage', 'inventory'].includes(view);
    }
    if (r === 'HR Admin') {
      return ['attendance', 'users'].includes(view);
    }
    return false;
  };

  // Generic Firestore delete helper
  const deleteItem = async (endpoint: string, id: string) => {
    try {
      const collectionName = ENDPOINT_COLLECTION_MAP[endpoint] || endpoint;
      await deleteDoc(doc(db, collectionName, id));
      await stampAuditLog(currentUser?.username || 'Anonymous', "DELETE", endpoint, `Deleted document ID: ${id}`);
      return true;
    } catch (e) {
      console.error(`Error deleting from ${endpoint}:`, e);
    }
    return false;
  };

  // Post element back to Firestore
  const pushItem = async (endpoint: string, item: any) => {
    try {
      const collectionName = ENDPOINT_COLLECTION_MAP[endpoint] || endpoint;
      
      // Enforce custom taxInfo saving logic (singleton config doc)
      if (endpoint.toLowerCase() === 'taxinfo') {
        const payload = { ...item };
        await setDoc(doc(db, 'systemConfig', 'taxInfo'), payload);
        await stampAuditLog(currentUser?.username || 'Anonymous', "UPDATE", "taxInfo", "Updated Taxpayer Profile data.");
        return true;
      }

      const keyId = endpoint === 'recipes' ? 'productId' : 'id';
      let docId = item[keyId];
      if (!docId) {
        const prefix = endpoint.slice(0, 3).toLowerCase();
        docId = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        item[keyId] = docId;
      }

      if (endpoint === 'recipes') {
        docId = `${item.productId}_${item.ingredientId}`;
      }

      await setDoc(doc(db, collectionName, docId), item);
      await stampAuditLog(currentUser?.username || 'Anonymous', item[keyId] ? "UPDATE" : "CREATE", endpoint, `Created or updated ${endpoint}: ${item.name || docId}`);
      return true;
    } catch (e) {
      console.error(`Firestore pushItem error at endpoint ${endpoint}:`, e);
    }
    return false;
  };

  const handleAddOrUpdateBranch = async (b: any) => {
    return await pushItem('branches', b);
  };

  const handleDeleteBranch = async (id: string) => {
    return await deleteItem('branches', id);
  };

  // POST Transaction operation
  const submitTransaction = async (txPayload: any) => {
    try {
      const tx = { ...txPayload };
      tx.id = `txn-${Date.now()}`;
      tx.dateTime = new Date().toISOString();
      tx.status = "Completed";

      // 1. Deduct Inventory based on Recipes of sold items index
      for (const saleItem of tx.items) {
        const recipesFound = recipes.filter((rx: any) => rx.productId === saleItem.productId);
        for (const r of recipesFound) {
          const invItem = inventory.find(
            (inv: any) =>
              inv.id === r.ingredientId &&
              (inv.branchId === tx.branchId || inv.branchId === "All")
          );
          if (invItem) {
            const qtyToDeduct = (Number(r.quantityNeeded) || 0) * (Number(saleItem.qty) || 0);
            const newQty = Math.max(0, (Number(invItem.quantity) || 0) - qtyToDeduct);
            await updateDoc(doc(db, 'inventory', invItem.id), { quantity: newQty });
          }
        }
      }

      // Calculate actual sales count on open shift and update actual cash count
      const activeShiftFound = shifts.find(
        (s: any) => s.cashierId === tx.cashierId && s.status === "Open" && s.branchId === tx.branchId
      );
      if (activeShiftFound) {
        const updatedSalesCount = (activeShiftFound.salesCount || 0) + 1;
        const updatedExpectedCash = (activeShiftFound.expectedCash || 0) + (tx.paymentMethod === "Cash" ? Number(tx.netTotal) : 0);
        await updateDoc(doc(db, 'shifts', activeShiftFound.id), {
          salesCount: updatedSalesCount,
          expectedCash: updatedExpectedCash
        });
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
          size: it.size || '',
          notes: it.notes || ''
        }))
      };

      await setDoc(doc(db, 'kdsOrders', kdsItem.id), kdsItem);
      await setDoc(doc(db, 'sales', tx.id), tx);

      await stampAuditLog(currentUser?.username || 'Anonymous', "Sale", "POS", `Processed Transaction ${tx.id} - Total Amount: ${tx.netTotal}`);

      // 3. Loyalty system updates on checkout completion
      if (selectedLoyaltyCustId) {
        const foundCust = customers.find(c => c.id === selectedLoyaltyCustId);
        if (foundCust) {
          const updatedCust = {
            ...foundCust,
            visits: (foundCust.visits || 0) + 1,
            spend: Number(((foundCust.spend || 0) + tx.netTotal).toFixed(2))
          };
          await setDoc(doc(db, 'customers', foundCust.id), updatedCust);
          await stampAuditLog(currentUser?.username || 'Anonymous', "LoyaltyUpdate", "POS", `Incremented visits for loyalty member ${foundCust.fullName}. Total visits: ${updatedCust.visits}. Total spend: ${updatedCust.spend}`);
        }
      }

      setCart([]);
      setCustomerName('');
      setAmountPaidInput('');
      setPaymentRefNo('');
      setPaxEligibleDiscount(0);
      setPaxTotalCount(1);
      setCheckoutModalOpen(false);
      setSelectedLoyaltyCustId('');
      
      alert("Transaction completed successfully! Re-routing order to direct kitchen timer queue...");
    } catch (e) {
      console.error(e);
      alert("Error printing recipe connection logs.");
    }
  };

  // Void execution triggers
  const executeVoid = async () => {
    try {
      const txn = sales.find((s) => s.id === voidTxnId);
      if (!txn) {
        alert("POS Transaction not found");
        return;
      }

      // Validate managerial role PIN
      const authorizedManager = users.find(
        (u) => u.pin === voidManagerPin && (u.role === "Admin" || u.role === "Manager" || u.role === "Supervisor")
      );
      if (!authorizedManager) {
        alert("Access Denied: Invalid Manager PIN authorization code");
        return;
      }

      if (txn.status === "Voided") {
        alert("This receipt has already been voided");
        return;
      }

      // Revoke invoice
      await updateDoc(doc(db, 'sales', txn.id), {
        status: "Voided",
        voidReason: voidReason || "Unspecified POS error correction",
        voidApprovedBy: authorizedManager.fullName
      });

      // Revert / Add back inventory ingredients counts
      for (const saleItem of txn.items) {
        const recipesFound = recipes.filter((rx: any) => rx.productId === saleItem.productId);
        for (const r of recipesFound) {
          const invItem = inventory.find(
            (inv: any) =>
              inv.id === r.ingredientId &&
              (inv.branchId === txn.branchId || inv.branchId === "All")
          );
          if (invItem) {
            const qtyToRevert = (Number(r.quantityNeeded) || 0) * (Number(saleItem.qty) || 0);
            const newQty = (Number(invItem.quantity) || 0) + qtyToRevert;
            await updateDoc(doc(db, 'inventory', invItem.id), { quantity: newQty });
          }
        }
      }

      // Revert shift expected cashier cash
      const activeShiftFound = shifts.find(
        (s: any) => s.cashierId === txn.cashierId && s.status === "Open" && s.branchId === txn.branchId
      );
      if (activeShiftFound) {
        const newExpectedCash = Math.max(0, (activeShiftFound.expectedCash || 0) - (txn.paymentMethod === "Cash" ? Number(txn.netTotal) : 0));
        await updateDoc(doc(db, 'shifts', activeShiftFound.id), {
          expectedCash: newExpectedCash
        });
      }

      await stampAuditLog(currentUser?.username || 'Anonymous', "VoidTransaction", "Security", `Voided receipt ${txn.id} by manager ${authorizedManager.fullName}`);

      setVoidTxnId('');
      setVoidReason('');
      setVoidManagerPin('');
      setVoidModalOpen(false);
      alert("Security cleared: Receipt successfully voided. Inventory reverted back.");
    } catch (e) {
      console.error(e);
      alert("Void process failure");
    }
  };

  // Open operational shifts drawer
  const handleOpenShift = async () => {
    const sPayload = {
      cashierId: currentUser!.username,
      branchId: activeBranch,
      startTime: new Date().toISOString(),
      openingCash: Number(openingCashInput) || 0,
      expectedCash: Number(openingCashInput) || 0,
      expensesLogged: 0,
      salesCount: 0,
      status: 'Open' as const
    };
    await pushItem('shifts', sPayload);
  };

  // Close shift session and process variances
  const handleCloseShift = async () => {
    if (!activeShift) return;
    const closing = Number(closingCashInput);
    if (isNaN(closing)) return alert("Please specify realistic drawer end balances.");
    
    const updated = {
      ...activeShift,
      endTime: new Date().toISOString(),
      closingCash: closing,
      variance: closing - (activeShift.expectedCash || 0),
      status: 'Closed' as const
    };
    await pushItem('shifts', updated);
    setClosingCashInput('');
    setActiveShift(null);
    alert("Shifts reconciled and closed successfully!");
  };

  // Logging shift out-of-drawer petty expense
  const handleAddShiftExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    const form = e.currentTarget as HTMLFormElement;
    const amount = Number((form.elements.namedItem('expenseAmount') as HTMLInputElement).value);
    const description = (form.elements.namedItem('expenseDesc') as HTMLInputElement).value;
    
    if (isNaN(amount) || amount <= 0) return alert("Valid expense required");

    const expPayload = {
      id: `se-${Date.now()}`,
      shiftId: activeShift.id,
      amount,
      description
    };
    
    await pushItem('shift-expenses', expPayload);
    
    // Deduct expected cashier drawer cash
    const updatedShift = {
      ...activeShift,
      expensesLogged: (activeShift.expensesLogged || 0) + amount,
      expectedCash: (activeShift.expectedCash || 0) - amount
    };
    await pushItem('shifts', updatedShift);
    form.reset();
    alert("Operational drawer expense registered successfully.");
  };

  // Adding product to sales cart
  const addToCart = (product: Product) => {
    const existing = cart.find((i) => i.product.id === product.id);
    if (existing) {
      setCart(cart.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { product, qty: 1, size: 'Regular', notes: '' }]);
    }
  };

  const updateCartQty = (productId: string, val: number) => {
    if (val <= 0) {
      setCart(cart.filter((c) => c.product.id !== productId));
    } else {
      setCart(cart.map((c) => c.product.id === productId ? { ...c, qty: val } : c));
    }
  };

  const updateCartSize = (productId: string, size: '12oz' | '16oz' | 'Regular') => {
    setCart(cart.map((c) => c.product.id === productId ? { ...c, size } : c));
  };

  const updateCartNotes = (productId: string, notes: string) => {
    setCart(cart.map((c) => c.product.id === productId ? { ...c, notes } : c));
  };

  // Pricing math inside POS Cart
  // Standard prices are adjusted dynamically if sizes variations are clicked e.g. +₱20 for 16oz
  const computedCartSubtotal = cart.reduce((acc, current) => {
    let price = current.product.price;
    if (current.size === '16oz') price += 20;
    if (current.size === '12oz') price -= 10;
    return acc + (price * current.qty);
  }, 0);

  // Discount calculator for Senior citizens / PWD:
  // calculates eligible pax vs total pax percentage
  const appliedDiscount = (() => {
    if (paxEligibleDiscount <= 0 || paxTotalCount <= 0) return 0;
    const ratio = Math.min(1, paxEligibleDiscount / paxTotalCount);
    // PH Senior/PWD discount is 20% on their portion (which we calculate as ratio of total bill)
    return Number((computedCartSubtotal * ratio * 0.20).toFixed(2));
  })();

  const matchedWaitLoyaltyCust = customers.find(c => c.id === selectedLoyaltyCustId);
  const loyaltyDiscountPercent = (() => {
    if (!matchedWaitLoyaltyCust) return 0;
    const v = matchedWaitLoyaltyCust.visits || 0;
    if (v >= 10) return 0.15;
    if (v >= 6) return 0.10;
    if (v >= 3) return 0.05;
    return 0;
  })();

  const loyaltyDiscountAmount = (() => {
    if (!matchedWaitLoyaltyCust) return 0;
    return Number((computedCartSubtotal * loyaltyDiscountPercent).toFixed(2));
  })();

  const subtotalAfterDiscount = Number((computedCartSubtotal - appliedDiscount - loyaltyDiscountAmount).toFixed(2));
  const computedTax = Number((subtotalAfterDiscount * 0.12).toFixed(2));
  const computedNetTotal = Number((subtotalAfterDiscount + computedTax).toFixed(2));

  // Handle final checkout posting
  const handleProceedCheckout = () => {
    if (cart.length === 0) return alert("POS Cart is empty");
    if (!activeShift) return alert("No active shift session opened. Please open shift to transact.");
    setCheckoutModalOpen(true);
  };

  const handleProcessSaleSubmit = () => {
    const cashReceived = Number(amountPaidInput);
    if (paymentMethod === 'Cash' && (isNaN(cashReceived) || cashReceived < computedNetTotal)) {
      return alert("Insufficient cash payment amount received.");
    }
    if (paymentMethod !== 'Cash' && !paymentRefNo.trim()) {
      return alert("E-wallet reference trace id required.");
    }

    const txPayload: SaleTransaction = {
      id: '',
      dateTime: '',
      branchId: activeBranch,
      cashierId: currentUser!.username,
      customerName: customerName.trim() || 'Walk-In Guest',
      items: cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        qty: c.qty,
        price: c.product.price + (c.size === '16oz' ? 20 : c.size === '12oz' ? -10 : 0),
        size: c.size,
        notes: c.notes
      })),
      paymentMethod,
      refNumber: paymentRefNo,
      subtotal: computedCartSubtotal,
      tax: computedTax,
      discount: appliedDiscount,
      paxEligible: paxEligibleDiscount,
      totalPax: paxTotalCount,
      netTotal: computedNetTotal,
      amountPaid: paymentMethod === 'Cash' ? cashReceived : computedNetTotal,
      change: paymentMethod === 'Cash' ? Number((cashReceived - computedNetTotal).toFixed(2)) : 0,
      status: 'Completed',
      packageType: cart[0]?.product.categoryId === 'cat-4' ? 'Food Trays' : 'Ala Carte'
    };

    submitTransaction(txPayload);
  };

  // Direct Procurement add state line
  const handleAddProcurementLine = () => {
    setDirectPurchaseItems([...directPurchaseItems, { name: '', qty: 10, unit: 'kg', unitPrice: 50 }]);
  };

  const handleUpdateProcurementLine = (idx: number, key: string, val: any) => {
    const updated = [...directPurchaseItems];
    (updated[idx] as any)[key] = val;
    setDirectPurchaseItems(updated);
  };

  const handleRemoveProcurementLine = (idx: number) => {
    setDirectPurchaseItems(directPurchaseItems.filter((_, i) => i !== idx));
  };

  const handleDirectPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItems = directPurchaseItems.filter((i) => i.name.trim() !== '');
    if (cleanItems.length === 0) return alert("Fill in valid direct purchase items.");

    const totalCalculated = cleanItems.reduce((acc, current) => acc + (current.qty * current.unitPrice), 0);
    const poPayload: DirectPurchase = {
      id: '',
      date: new Date().toISOString().slice(0, 10),
      dateTime: new Date().toISOString(),
      supplierName: selectedSupplier,
      supplierBrand: selectedSupplier.split(' ')[0],
      contactInfo: '0917-8889999',
      address: 'Central Manila Distribution Base',
      tin: '244-123-456-000',
      orSiNo: siNo || `SI-${Date.now().toString().slice(-4)}`,
      pcvNo: pcvNoInput || `PCV-${Date.now().toString().slice(-4)}`,
      department: procurementDept,
      branchId: activeBranch,
      items: cleanItems.map((c) => ({ ...c, total: c.qty * c.unitPrice })),
      totalAmount: totalCalculated,
      status: 'Received' // Direct approved and received
    };

    const success = await pushItem('direct-purchases', poPayload);
    if (success) {
      // Direct Purchase automatically injects received items into the General Inventory counts!
      cleanItems.forEach(async (purchaseItem) => {
        const match = inventory.find(
          (inv) => inv.name.toLowerCase() === purchaseItem.name.toLowerCase() && inv.branchId === activeBranch
        );
        if (match) {
          const updatedInv = {
            ...match,
            quantity: Number(match.quantity) + Number(purchaseItem.qty),
            unitCost: Number(purchaseItem.unitPrice)
          };
          await pushItem('inventory', updatedInv);
        } else {
          // Add as new ingredient into ledger
          const newing: InventoryItem = {
            id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            name: purchaseItem.name,
            unit: purchaseItem.unit,
            quantity: purchaseItem.qty,
            reorderLevel: 10,
            parLevel: 100,
            unitCost: purchaseItem.unitPrice,
            department: procurementDept,
            branchId: activeBranch
          };
          await pushItem('inventory', newing);
        }
      });

      // Inject as expenses in standard accounts MTD/YTD
      const budgetMatch = budgets.find(
        (b) => b.year === 2026 && b.month === 5 && b.department === procurementDept
      );
      if (budgetMatch) {
        const updatedB = {
          ...budgetMatch,
          actualAmount: (budgetMatch.actualAmount || 0) + totalCalculated
        };
        await pushItem('budgets', updatedB);
      }

      setDirectPurchaseItems([{ name: '', qty: 10, unit: 'kg', unitPrice: 50 }]);
      setSiNo('');
      setPcvNoInput('');
      alert("Direct Purchase recorded successfully! Inventory levels expanded and adjusted.");
    }
  };

  const handleLockUnlockSystem = () => {
    if (systemLocked) {
      if (lockPinInput === '1234' || lockPinInput === '8888') {
        setSystemLocked(false);
        setLockPinInput('');
      } else {
        alert("Invalid Chef Michael signature authentication code.");
      }
    } else {
      setSystemLocked(true);
    }
  };

  // Master Branch Metrics consolidated
  const branchMetrics = (() => {
    const result: Record<string, { actualToday: number; mtd: number; ytd: number; expensesToday: number }> = {};
    branches.forEach((b) => {
      result[b.name] = { actualToday: 0, mtd: 0, ytd: 0, expensesToday: 0 };
    });

    sales.forEach((s) => {
      if (s.status !== 'Voided' && result[s.branchId]) {
        result[s.branchId].actualToday += s.netTotal; // Today sales in prototype matches aggregate net
        result[s.branchId].mtd += s.netTotal * 12; // simulated scale
        result[s.branchId].ytd += s.netTotal * 144;
      }
    });

    directPurchases.forEach((dp) => {
      if (result[dp.branchId]) {
        result[dp.branchId].expensesToday += dp.totalAmount;
      }
    });

    return result;
  })();

  // Top 20 Best Sellers Calculation
  const topSellers = (() => {
    const freq: Record<string, number> = {};
    sales.forEach((s) => {
      if (s.status !== 'Voided') {
        s.items.forEach((it) => {
          freq[it.productName] = (freq[it.productName] || 0) + it.qty;
        });
      }
    });
    return Object.entries(freq)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 20);
  })();

  // Low stock inventory filtered values
  const lowStockItems = inventory.filter((item) => item.quantity <= item.reorderLevel && item.branchId === activeBranch);

  // Sign in redirect if session is null
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] p-4 font-sans antialiased text-gray-950">
        <div className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-6 shadow-lg">
          <div className="flex flex-col items-center space-y-2 border-b border-gray-150 pb-4 mb-4">
            <div className="rounded bg-blue-700 px-3 py-1 text-md font-black text-white font-display">
              JCC
            </div>
            <h2 className="text-sm font-extrabold uppercase tracking-tight text-gray-900">
              POS Systematic Terminal
            </h2>
            <p className="text-[10px] text-gray-500 font-semibold uppercase text-center">
              Chef Michael Llena Master Operational Control Access Panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="form-group text-xs text-left">
              <label className="text-[10px] font-bold uppercase text-gray-500">Employee Login Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter Username"
                className="mt-1 w-full rounded border border-gray-300 p-2 font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="form-group text-xs text-left">
              <label className="text-[10px] font-bold uppercase text-gray-500">Employee Access PIN</label>
              <input
                type="password"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                placeholder="4-Digit PIN"
                className="mt-1 w-full rounded border border-gray-300 p-2 font-mono text-center font-bold tracking-widest"
                maxLength={4}
              />
            </div>

            {loginError && (
              <p className="rounded bg-red-50 p-2 text-center text-[10px] font-bold text-red-600 border border-red-200">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded bg-blue-700 p-2.5 text-xs font-black uppercase text-white shadow-sm hover:bg-blue-800"
            >
              Authenticate System
            </button>
          </form>

          <div className="mt-4 border-t pt-3 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase">
            <span>Access Tier: SECURE</span>
            <span>Locale: Asia-PH</span>
          </div>
        </div>
      </div>
    );
  }

  // System Locked modal interface
  if (systemLocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4 font-sans text-white">
        <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl text-center space-y-4">
          <div className="text-red-500 animate-pulse text-4xl font-black">🔒 SYSTEM LOCKED</div>
          <p className="text-xs text-gray-400">
            Operations currently suspended to protect JCC Management financial balance privacy.
          </p>
          <div className="form-group text-left text-xs">
            <label className="text-[9px] font-extrabold uppercase text-gray-500 block mb-1">
              Input Master Release PIN (Code: 1234)
            </label>
            <input
              type="password"
              value={lockPinInput}
              onChange={(e) => setLockPinInput(e.target.value)}
              className="w-full rounded bg-gray-800 border border-gray-700 p-2 text-center text-md font-mono tracking-widest font-black text-green-400"
              maxLength={4}
            />
          </div>
          <button
            onClick={handleLockUnlockSystem}
            className="w-full rounded bg-red-600 p-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Authenticate Signature Release
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen flex-col bg-[#F3F4F6] font-sans text-gray-900 antialiased`}>
      {/* 2. Top Navigation Bar */}
      <header className="flex h-14 w-full items-center justify-between border-b border-gray-300 bg-white px-4 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 rounded bg-blue-700 flex items-center justify-center font-black text-white text-xs font-display">
            {(taxInfo.businessName || 'JCC').slice(0, 3).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-tight text-gray-950">
              {taxInfo.businessName || lex('brandName')} <span className="font-normal font-mono text-gray-400">v4.2</span>
            </h1>
            <p className="text-[8px] text-gray-500 font-semibold uppercase mt-0.5">
              Authorized controller: chef michael llena
            </p>
          </div>
        </div>

        {/* Dynamic Branch Dropdown filter */}
        <div className="flex items-center space-x-2">
          {currentUser.branch === 'All' ? (
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span className="text-[10px] font-extrabold uppercase text-gray-400">Active Office:</span>
              <select
                value={activeBranch}
                onChange={(e) => setActiveBranch(e.target.value)}
                className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-[11px] font-bold"
              >
                <option value="Cubao">Cubao Main Branch</option>
                <option value="Manila">Manila Branch</option>
                <option value="QC">QC Branch</option>
              </select>
            </div>
          ) : (
            <span className="rounded bg-blue-10 bg-gray-50 border px-2 py-1 text-[10px] font-black uppercase text-blue-800">
               📍 {activeBranch} Branch
            </span>
          )}

          {/* Core Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="rounded border border-gray-300 px-2 py-1 text-[11px] font-bold bg-white"
          >
            <option value="en">🇬🇧 English</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fil">🇵🇭 Tagalog</option>
            <option value="ar">🇸🇦 العربية</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-gray-900">{currentUser.fullName}</p>
            <p className="text-[8px] text-green-600 font-mono font-extrabold uppercase">
              Role: {currentUser.role} ({activeBranch})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded border border-gray-300 px-2.5 py-1 text-[10px] font-black uppercase hover:bg-gray-150"
          >
            Sign-Out
          </button>
        </div>
      </header>

      {/* 3. Operational Hub Layout grid */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Action Buttons Bar */}
        <aside className="w-52 border-r border-gray-300 bg-white p-3 flex flex-col space-y-4 shrink-0 overflow-y-auto">
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">Quick Controls</p>
            <button 
              onClick={() => { setActiveView('dashboard'); }} 
              className={`mb-1.5 w-full rounded px-2.5 py-2 text-left text-[11px] font-extrabold transition uppercase flex items-center justify-between ${
                activeView === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              <span>{lex('posSummary')}</span>
              <span className="text-[8px] bg-white text-blue-700 px-1 rounded">LIVE</span>
            </button>
            <button 
              onClick={() => setVoidModalOpen(true)}
              className="mb-1.5 w-full rounded border border-gray-200 bg-gray-50 px-2.5 py-2 text-left text-[11px] font-extrabold text-red-650 hover:bg-red-50 transition uppercase"
            >
              {lex('voidRequest')}
            </button>
            <button 
              onClick={() => setActiveView('inventory')} 
              className="w-full rounded border border-gray-200 bg-gray-50 px-2.5 py-2 text-left text-[11px] font-extrabold text-gray-700 hover:bg-gray-100 transition uppercase"
            >
              {lex('stockTransfer')}
            </button>
          </div>

          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">Operations Hub</p>
            <nav className="space-y-1 text-xs font-semibold">
              {[
                { view: 'dashboard', label: lex('dashboard'), visible: currentUser?.role !== 'HR Admin' },
                { view: 'pos', label: lex('pos'), visible: hasAccess('pos') },
                { view: 'kds', label: lex('kds'), visible: hasAccess('kds') },
                { view: 'shifts', label: lex('shifts'), visible: hasAccess('shifts') },
                { view: 'inventory', label: lex('inventory'), visible: hasAccess('inventory') },
                { view: 'procurement', label: lex('procurement'), visible: hasAccess('procurement') },
                { view: 'wastage', label: lex('wastage'), visible: hasAccess('wastage') },
                { view: 'production', label: lex('productionHub'), visible: hasAccess('production') },
                { view: 'attendance', label: lex('staffAttendance'), visible: hasAccess('attendance') },
                { view: 'reservations', label: lex('reservations'), visible: hasAccess('reservations') },
                { view: 'customers', label: 'VIP Loyalty Program 🌟', visible: hasAccess('customers') },
                { view: 'bir', label: lex('birCompliance'), visible: hasAccess('bir') },
                { view: 'event-weddings', label: lex('weddingBanq'), visible: hasAccess('pos') },
                { view: 'budget', label: 'Budget & P&L 📊', visible: hasAccess('procurement') },
                { view: 'users', label: 'User Management ⚙️', visible: currentUser?.role === 'Admin' },
              ].map((item) => {
                if (!item.visible) return null;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    className={`w-full text-left p-2 rounded transition font-black text-[11px] uppercase ${
                      activeView === item.view ? 'bg-blue-50 text-blue-750 font-bold border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Low Stock Alerts list in bottom-left */}
          <div className="mt-auto rounded-lg bg-gray-900 p-2.5 text-white">
            <p className="text-[9px] font-black uppercase text-red-400 tracking-wider">
              🚨 {lex('lowStockNotice')}
            </p>
            {lowStockItems.length === 0 ? (
              <p className="mt-1 text-[10px] text-gray-400 font-semibold uppercase">All stocks OK ({inventory.length} SKUs)</p>
            ) : (
              <div className="mt-2 space-y-1">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span className="truncate w-2/3">{item.name}</span>
                      <span className="text-red-400">{item.quantity} {item.unit}</span>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 3 && (
                  <p className="text-[8px] text-yellow-400 text-right font-bold uppercase mt-1">
                    + {lowStockItems.length - 3} more alerts!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-100 rounded p-2 text-center">
            <button
              onClick={() => setSystemLocked(true)}
              className="text-[10px] text-red-500 font-extrabold uppercase hover:underline"
            >
              🔒 LOCK TERMINAL
            </button>
          </div>
        </aside>

        {/* 4. Core Screen Panel Render Area */}
        <main className="flex-1 p-4 overflow-y-auto">
          
          {/* VIEWPORT: DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="space-y-4">
              {/* Bento Grid top row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase text-gray-500">Today Sales (All Branches)</span>
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-green-700">
                      +11.4%
                    </span>
                  </div>
                  <p className="text-xl font-black text-blue-800 mt-1">
                    {formatMoney(sales.filter(s=>s.status!=='Voided').reduce((acc, c) => acc + c.netTotal, 0))}
                  </p>
                  <div className="mt-2 flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                    <span>MTD: ₱8.2M</span>
                    <span>YTD: ₱94.5M</span>
                  </div>
                </div>

                <div className="rounded-xl border border-red-200 bg-white p-3 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-gray-500 block">Today Expenses</span>
                    <p className="text-xl font-black text-red-600 mt-1">
                      {formatMoney(directPurchases.reduce((acc, c) => acc + c.totalAmount, 0))}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] font-medium text-gray-400 uppercase">
                    <span>Kitchen: {formatMoney(directPurchases.filter(d=>d.department==='Kitchen').reduce((a,c)=>a+c.totalAmount,0))}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-gray-500 block">Upcoming reservations</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="flex h-8 w-8 flex-col items-center justify-center rounded bg-gray-150 text-[9px] font-black">
                      <span>MAY</span><span>28</span>
                    </div>
                    <div className="text-[10px]">
                      <p className="font-extrabold">Catering: Abbott Group</p>
                      <p className="text-gray-400 font-semibold">10 Pax @ Garden</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-yellow-250 bg-white p-3 shadow-sm flex flex-col justify-between">
                  <span className="text-[9px] font-extrabold uppercase text-gray-500 block">BIR Filings Status</span>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-900">2550Q Q2 Return</span>
                    <span className="rounded bg-yellow-400 px-1 py-0.5 text-[8px] font-bold text-gray-950 uppercase">
                      Pending sign
                    </span>
                  </div>
                  <p className="text-[9px] text-red-500 font-semibold italic mt-1 uppercase">Deadline is coming up soon!</p>
                </div>
              </div>

              {/* Middle Breakdown Split Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 h-full rounded-xl border border-gray-300 bg-white overflow-hidden flex flex-col shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
                      MTD/YTD Branch Performance Metrics
                    </h3>
                  </div>
                  <div className="p-3">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="border-b text-[9px] font-black uppercase text-gray-400">
                          <th className="py-2">Branch Location</th>
                          <th>Gross Sales</th>
                          <th>Direct Expenses</th>
                          <th>MTD Forecast</th>
                          <th>YTD Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {Object.entries(branchMetrics).map(([name, m]) => (
                          <tr key={name}>
                            <td className="py-2 font-bold text-gray-900">{name} Office</td>
                            <td className="font-mono text-gray-800">{formatMoney(m.actualToday)}</td>
                            <td className="font-mono text-red-600">{formatMoney(m.expensesToday)}</td>
                            <td className="font-mono font-bold text-green-600">{formatMoney(m.mtd)}</td>
                            <td className="font-mono text-blue-700">{formatMoney(m.ytd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Sellers Chart/List segment */}
                <div className="rounded-xl border border-gray-300 bg-white shadow-sm flex flex-col">
                  <div className="border-b border-gray-150 bg-gray-50 px-3 py-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
                      Top 20 Best Sellers Combinations
                    </h3>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto max-h-[190px]">
                    {topSellers.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">No active sale items registered</p>
                    ) : (
                      topSellers.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center text-[10px] p-1.5 hover:bg-gray-50 rounded">
                          <span className="font-bold text-gray-700">
                            <span className="text-gray-400 mr-1.5">#{idx + 1}</span> {item.name}
                          </span>
                          <span className="font-mono bg-blue-50 text-blue-800 px-1 font-extrabold rounded">{item.qty} units sold</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Operational Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-300 bg-white p-3 space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Commissary Production Status
                  </h4>
                  <div className="space-y-1.5 text-xs text-gray-800">
                    <div className="flex justify-between font-bold">
                      <span>Roast Pork Tray specs</span>
                      <span>85% Completed</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-[9px] text-gray-400 italic font-medium uppercase mt-1">Ingredients: deducted from warehouse</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-300 bg-white p-3 space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Shift Log & Attendance Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="bg-green-50 rounded p-1">
                      <p className="text-[9px] text-green-700 uppercase">Clocked-In</p>
                      <p className="font-bold text-md text-green-900">
                        {attendance.filter(a=>a.date === new Date().toISOString().slice(0, 10)).length || 4}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded p-1">
                      <p className="text-[9px] text-red-700 uppercase font-bold">On Expense</p>
                      <p className="font-bold text-md text-red-900">{shiftExpenses.length || 0}</p>
                    </div>
                    <div className="bg-gray-100 rounded p-1">
                      <p className="text-[9px] text-gray-550 uppercase">Shifts</p>
                      <p className="font-bold text-md text-gray-800">{shifts.length || 1}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-300 bg-white p-3 flex flex-col justify-between">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Revenue Variance Alert Thresholds
                  </h4>
                  <div className="text-[10px] space-y-1 text-gray-700">
                    <div className="flex justify-between font-mono">
                      <span>Total Wastage:</span>
                      <span className="text-red-500 font-bold">
                        -{formatMoney(wastages.reduce((sum, current) => sum + current.cost, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span>Plates/Glass Breakages:</span>
                      <span className="text-red-500 font-bold">
                        -{formatMoney(breakages.reduce((sum, current) => sum + current.cost, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEWPORT: POS */}
          {activeView === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Product matrix */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
                  <div className="flex space-x-2 text-xs">
                    <button
                      onClick={() => { setPosPackageType('All'); setPosCategory('all'); }}
                      className={`px-3 py-1 rounded font-bold uppercase transition ${
                        posPackageType === 'All' ? 'bg-blue-700 text-white' : 'bg-white border text-gray-600'
                      }`}
                    >
                      All Items
                    </button>
                    <button
                      onClick={() => { setPosPackageType('Ala Carte'); setPosCategory('all'); }}
                      className={`px-3 py-1 rounded font-bold uppercase transition ${
                        posPackageType === 'Ala Carte' ? 'bg-blue-700 text-white' : 'bg-white border text-gray-600'
                      }`}
                    >
                      Ala Carte
                    </button>
                    <button
                      onClick={() => { setPosPackageType('Food Trays'); setPosCategory('all'); }}
                      className={`px-3 py-1 rounded font-bold uppercase transition ${
                        posPackageType === 'Food Trays' ? 'bg-blue-700 text-white' : 'bg-white border text-gray-600'
                      }`}
                    >
                      Specialty Packages & Trays / Bento
                    </button>
                  </div>
                </div>

                {/* Subcategories picker */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPosCategory('all')}
                    className={`px-2 py-1 text-[11px] font-bold rounded ${
                      posCategory === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-white border'
                    }`}
                  >
                    All Sub-cats
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPosCategory(cat.id)}
                      className={`px-2 py-1 text-[11px] font-bold rounded ${
                        posCategory === cat.id ? 'bg-blue-100 text-blue-800' : 'bg-white border'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Product Tiles Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products
                    .filter((p) => {
                      if (posPackageType !== 'All') {
                        const matchedCat = categories.find((c) => c.id === p.categoryId);
                        if (posPackageType === 'Ala Carte' && matchedCat?.parentType !== 'Ala Carte') return false;
                        if (posPackageType === 'Food Trays' && matchedCat?.parentType !== 'Packages') return false;
                      }
                      if (posCategory !== 'all' && p.categoryId !== posCategory) return false;
                      return p.branchId === 'All' || p.branchId === activeBranch;
                    })
                    .map((prod) => (
                      <button
                        key={prod.id}
                        disabled={!prod.available}
                        onClick={() => addToCart(prod)}
                        className={`p-3 rounded-lg border text-left flex flex-col justify-between h-24 transition shrink-0 ${
                          prod.available
                            ? 'bg-white hover:border-blue-500 border-gray-300 hover:shadow-sm'
                            : 'bg-gray-150 border-gray-200 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900 tracking-tight leading-tight">
                            {prod.name}
                          </p>
                          {prod.size && <span className="text-[9px] text-gray-400 font-mono">Size: {prod.size}</span>}
                        </div>
                        <div className="flex items-center justify-between w-full mt-2 border-t pt-1.5 border-dashed border-gray-150">
                          <span className="text-xs font-black text-blue-900 font-mono">
                            {formatMoney(prod.price)}
                          </span>
                          {!prod.available ? (
                            <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1 rounded">86'D</span>
                          ) : (
                            <span className="text-[8px] font-bold text-blue-500 group-hover:underline">Add +</span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* SALES CART SCREEN */}
              <div className="bg-white rounded-xl border border-gray-300 p-3 shadow-sm flex flex-col h-[520px]">
                <div className="border-b pb-2 mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-gray-800">Current Order Cart</h3>
                  <button
                    onClick={() => setCart([])}
                    className="text-[10px] uppercase font-bold text-gray-400 hover:text-red-500"
                  >
                    Clear All
                  </button>
                </div>

                {/* Cart scrolls */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 italic uppercase text-[10px] space-y-2">
                      <span>No items selected</span>
                      <p className="text-[8px] text-gray-300 text-center">Tap any product tiles on left to fill</p>
                    </div>
                  ) : (
                    cart.map((item) => {
                      let singlePrice = item.product.price;
                      if (item.size === '16oz') singlePrice += 20;
                      if (item.size === '12oz') singlePrice -= 10;

                      return (
                        <div key={item.product.id} className="border-b pb-2 space-y-1.5">
                          <div className="flex justify-between items-start">
                            <div className="font-extrabold text-xs text-gray-900">
                              {item.product.name}
                            </div>
                            <span className="font-mono text-gray-700 font-bold">{formatMoney(singlePrice * item.qty)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            {/* Qty increment block */}
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => updateCartQty(item.product.id, item.qty - 1)}
                                className="h-5 w-5 bg-gray-100 rounded border hover:bg-gray-200 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-bold">{item.qty}</span>
                              <button
                                onClick={() => updateCartQty(item.product.id, item.qty + 1)}
                                className="h-5 w-5 bg-gray-100 rounded border hover:bg-gray-200 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>

                            {/* Vol Variant drop */}
                            {item.product.categoryId === 'cat-1' && (
                              <select
                                value={item.size}
                                onChange={(e: any) => updateCartSize(item.product.id, e.target.value)}
                                className="border p-0.5 rounded text-[9px] font-bold"
                              >
                                <option value="Regular">Regular</option>
                                <option value="12oz">12oz (-₱10)</option>
                                <option value="16oz">16oz (+₱20)</option>
                              </select>
                            )}
                          </div>

                          {/* Notes block */}
                          <input
                            type="text"
                            placeholder="Add item note (e.g., Less ice, no onions)"
                            value={item.notes}
                            onChange={(e) => updateCartNotes(item.product.id, e.target.value)}
                            className="w-full text-[9px] text-gray-600 bg-gray-50 border border-gray-200 p-1.5 rounded"
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* POS Totals Calculation details */}
                <div className="border-t pt-2 mt-2 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatMoney(computedCartSubtotal)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-red-500 font-bold">
                      <span>PWD/Senior Discount:</span>
                      <span className="font-mono">-{formatMoney(appliedDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Output VAT (12% Included):</span>
                    <span className="font-mono">{formatMoney(computedTax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed pt-1 font-extrabold text-blue-900 text-sm">
                    <span>Total Net Invoice:</span>
                    <span className="font-mono">{formatMoney(computedNetTotal)}</span>
                  </div>

                  <button
                    onClick={handleProceedCheckout}
                    className="w-full mt-2 rounded bg-blue-700 p-2.5 text-xs font-black uppercase text-white shadow hover:bg-blue-800"
                  >
                    Proceed Checkout (FPT)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEWPORT: KDS (Kitchen Display System) */}
          {activeView === 'kds' && (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-center text-xs">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">
                    👨‍🍳 active kitchen display system
                  </h2>
                  <p className="text-[10px] text-gray-400">Order Routing with integrated timers and delays indicators</p>
                </div>
                <div className="flex space-x-2 text-[10px] font-bold">
                  <span className="rounded-full bg-green-150 px-2 py-0.5 text-green-700">● ON TIME (0-5 MINS)</span>
                  <span className="rounded-full bg-amber px-2 py-0.5 text-yellow-900">● WARNING (5-10 MINS)</span>
                  <span className="rounded-full bg-red-400 px-2 py-0.5 text-red-900 animate-pulse">● DELAYED (10+ MINS)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {kdsOrders
                  .filter((o) => o.status !== 'Completed')
                  .map((order) => {
                    const diffMins = Math.floor((Date.now() - new Date(order.dateTime).getTime()) / 60000);
                    let alertColor = 'border-green-400';
                    let badgeBg = 'bg-green-100 text-green-800';
                    if (diffMins > 10) {
                      alertColor = 'border-red-500 pulsing-alert';
                      badgeBg = 'bg-red-100 text-red-800 font-extrabold';
                    } else if (diffMins > 5) {
                      alertColor = 'border-yellow-400';
                      badgeBg = 'bg-yellow-100 text-yellow-800';
                    }

                    return (
                      <div key={order.id} className={`bg-white rounded-lg border-t-4 ${alertColor} p-3 shadow-sm flex flex-col justify-between h-56 text-xs`}>
                        <div>
                          <div className="flex justify-between items-center border-b pb-1.5 mb-2 text-[10px] font-bold uppercase text-gray-400">
                            <span>Txn Ref: {order.transactionId.slice(-6)}</span>
                            <span className={`px-1.5 py-0.5 rounded ${badgeBg}`}>{diffMins} min ago</span>
                          </div>
                          
                          <div className="space-y-1.5 max-h-24 overflow-y-auto font-medium text-gray-700">
                            {order.items.map((it, i) => (
                              <div key={i} className="flex justify-between">
                                <span>{it.qty}x {it.productName}</span>
                                {it.size && <span className="text-[10px] text-gray-400 font-mono">({it.size})</span>}
                                {it.notes && <p className="text-[9px] text-orange-500 italic block">*{it.notes}</p>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-2 mt-2">
                          <button
                            onClick={async () => {
                              const endpoint = order.status === 'Preparing' ? 'Ready' : 'Completed';
                              try {
                                await updateDoc(doc(db, 'kdsOrders', order.id), { status: endpoint });
                              } catch (e) {
                                console.error("KDS status update error:", e);
                              }
                            }}
                            className="w-full rounded bg-blue-700 py-1.5 text-[10px] font-black uppercase text-white shadow hover:bg-blue-800"
                          >
                            Mark {order.status === 'Preparing' ? 'Ready' : 'Served'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VIEWPORT: SHIFTS */}
          {activeView === 'shifts' && (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-center text-xs">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">
                    ⏱️ Cashier Shift Session & Reconciliation
                  </h2>
                  <p className="text-[10px] text-gray-400">Reconcile drawers, register expenditures, process Z-readings</p>
                </div>
              </div>

              {!activeShift ? (
                <div className="max-w-md mx-auto rounded-lg border border-gray-300 bg-white p-6 shadow-sm space-y-4 text-xs font-semibold text-gray-800 text-left">
                  <h3 className="text-sm font-extrabold uppercase text-blue-800">Open Shifts Drawer Session</h3>
                  <div className="form-group">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Opening Drawer Cash Amount (PHP)</label>
                    <input
                      type="number"
                      value={openingCashInput}
                      onChange={(e) => setOpeningCashInput(e.target.value)}
                      className="mt-1 w-full rounded border p-2 text-md font-mono font-black"
                    />
                  </div>
                  <button
                    onClick={handleOpenShift}
                    className="w-full rounded bg-blue-700 p-2.5 text-xs font-black uppercase text-white shadow-sm hover:bg-blue-800"
                  >
                    Open Active Shift Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                  {/* Current Active details */}
                  <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-3">
                    <h3 className="text-sm font-extrabold uppercase text-blue-800 tracking-wider">
                      Active Shift Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs leading-loose font-mono">
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Cashier ID:</span>
                        <p className="font-bold">{activeShift.cashierId}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Start Time:</span>
                        <p className="font-bold">{new Date(activeShift.startTime).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Opening Drawer Cash:</span>
                        <p className="font-bold">{formatMoney(activeShift.openingCash)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Logged Outlay Expenses:</span>
                        <p className="font-bold text-red-500">-{formatMoney(activeShift.expensesLogged || 0)}</p>
                      </div>
                      <div className="col-span-2 border-t pt-1.5 border-dashed">
                        <span className="text-blue-700 text-[10px] uppercase font-black">Expected Drawer Balance:</span>
                        <p className="font-bold text-sm text-green-700">{formatMoney(activeShift.expectedCash || 0)}</p>
                      </div>
                    </div>

                    {/* Closing drawer inputs */}
                    <div className="border-t pt-3 border-dashed space-y-3">
                      <div className="form-group text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                          Declare Reconciled Cash Balance (Blind Count)
                        </label>
                        <input
                          type="number"
                          value={closingCashInput}
                          onChange={(e) => setClosingCashInput(e.target.value)}
                          className="w-full rounded border p-2 text-md font-mono font-black"
                          placeholder="₱ Enter actual cash in drawer"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setZReadingShift(activeShift); }}
                          className="flex-1 rounded border border-gray-350 p-2 font-bold uppercase transition"
                        >
                          Show Z-Reading Report
                        </button>
                        <button
                          onClick={handleCloseShift}
                          className="flex-1 rounded bg-red-600 p-2 text-white font-bold uppercase hover:bg-red-700"
                        >
                          Submit Close Reconcile
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Outlay petty cash register */}
                  <div className="bg-white rounded-lg border border-gray-300 p-4 shadow flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase text-blue-800 tracking-wider">
                        Register Petty Cash Outlay Drawer Expense
                      </h3>
                      <p className="text-[10px] text-gray-500 leading-normal mt-1 mb-3 font-semibold uppercase">
                        Record minor cash spending (e.g. buying ice, quick supplies) straight from drawer Cash
                      </p>
                      <form onSubmit={handleAddShiftExpense} className="space-y-3">
                        <div className="form-group">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Expense Outlay Amount (PHP)</label>
                          <input
                            type="number"
                            name="expenseAmount"
                            required
                            className="mt-1 w-full rounded border p-2 font-mono"
                          />
                        </div>
                        <div className="form-group">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Expense Item/Vendor Description</label>
                          <input
                            type="text"
                            name="expenseDesc"
                            required
                            className="mt-1 w-full rounded border p-2"
                            placeholder="e.g. Purified tube Ice block mix"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded bg-gray-800 text-white font-bold p-2 text-xs uppercase hover:bg-black"
                        >
                          Register Outlay Deduct
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEWPORT: GENERAL INVENTORY */}
          {activeView === 'inventory' && (
            <div className="space-y-4">
              <InventoryManagerComponent
                currentUser={currentUser}
                activeBranch={activeBranch}
                inventory={inventory}
                directPurchases={directPurchases}
                branches={branches}
                transfers={transfers}
                onAddOrUpdateInventory={async (item) => pushItem('inventory', item)}
                onAddOrUpdatePurchase={async (purchase) => pushItem('direct-purchases', purchase)}
                onAddOrUpdateTransfer={async (transfer) => pushItem('inter-branch-transfers', transfer)}
                onAddWastageLog={async (log) => pushItem('wastages', log)}
                formatMoney={formatMoney}
              />
            </div>
          )}

          {/* VIEWPORT: PROCUREMENT */}
          {activeView === 'procurement' && (
            <div className="space-y-4">
              <ProcurementManagerComponent
                currentUser={currentUser}
                activeBranch={activeBranch}
                directPurchases={directPurchases}
                branches={branches}
                budgets={budgets}
                onAddOrUpdatePurchase={async (purchase) => pushItem('direct-purchases', purchase)}
                onAddOrUpdateBudget={async (budget) => pushItem('budgets', budget)}
                formatMoney={formatMoney}
                taxInfo={taxInfo}
              />
            </div>
          )}

          {/* VIEWPORT: WASTAGE */}
          {activeView === 'wastage' && (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-center text-xs">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">
                    🗑️ wastage & spillage variances logs
                  </h2>
                  <p className="text-[10px] text-gray-400">Track raw material spoilage before and after buffet set up</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const ingId = (form.elements.namedItem('wastageIng') as HTMLSelectElement).value;
                    const qty = Number((form.elements.namedItem('wastageQty') as HTMLInputElement).value);
                    const type = (form.elements.namedItem('wastageType') as HTMLSelectElement).value as any;
                    const reason = (form.elements.namedItem('wastageReason') as HTMLInputElement).value;

                    const match = inventory.find((i) => i.id === ingId);
                    if (!match) return;

                    const wPayload: WastageLog = {
                      id: `w-${Date.now()}`,
                      date: new Date().toISOString().slice(0, 10),
                      branchId: activeBranch,
                      department: match.department,
                      ingredientId: ingId,
                      qtyWasted: qty,
                      unit: match.unit,
                      cost: qty * match.unitCost,
                      wasteType: type,
                      reason
                    };

                    const success = await pushItem('wastages', wPayload);
                    if (success) {
                      // Deduct matching inventory
                      const updatedInv = {
                        ...match,
                        quantity: Math.max(0, match.quantity - qty)
                      };
                      await pushItem('inventory', updatedInv);
                      form.reset();
                      alert("Wastage logged and deducted from stock.");
                    }
                  }}
                  className="bg-white rounded-lg border border-gray-300 p-4 shadow space-y-3"
                >
                  <h3 className="text-sm font-extrabold uppercase text-blue-800">Add Spoilage Row</h3>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Select Spoilage Ingredient</label>
                    <select name="wastageIng" className="mt-1 w-full rounded border p-2">
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} (Current: {inv.quantity} {inv.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity Wasted</label>
                      <input type="number" name="wastageQty" required className="mt-1 w-full rounded border p-1.5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Waste Category</label>
                      <select name="wastageType" className="mt-1 w-full rounded border p-1.5">
                        <option value="Spoilage">Spoilage</option>
                        <option value="Expired">Expired</option>
                        <option value="Wastage">Wastage</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Reason description</label>
                    <input type="text" name="wastageReason" required className="mt-1 w-full rounded border p-2" placeholder="e.g. Mold detected" />
                  </div>
                  <button type="submit" className="w-full rounded bg-blue-700 text-white font-bold p-2 text-xs uppercase hover:bg-blue-800">
                    Record Spoilage Value
                  </button>
                </form>

                <div className="md:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow overflow-hidden">
                  <h3 className="text-xs font-black uppercase text-gray-700 border-b pb-1 mb-2">History logs</h3>
                  <div className="space-y-2 pr-1 select-none max-h-60 overflow-y-auto">
                    {wastages.map((w) => {
                      const matchedIn = inventory.find((i) => i.id === w.ingredientId);
                      return (
                        <div key={w.id} className="border-b pb-1.5 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-extrabold text-blue-900">{matchedIn ? matchedIn.name : 'Unknown Item'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">Date: {w.date} | Reason: {w.reason} | Type: {w.wasteType}</p>
                          </div>
                          <span className="font-mono text-red-600 font-extrabold">-{formatMoney(w.cost)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEWPORT: CENTRAL COMMISSARY PRODUCTION & COSTING */}
          {activeView === 'production' && (
            <div className="space-y-4">
              <CommissaryProductionComponent
                currentUser={currentUser}
                activeBranch={activeBranch}
                inventory={inventory}
                directPurchases={directPurchases}
                menuCostingRecipes={menuCostingRecipes}
                productions={productions}
                rndLogs={rndLogs}
                complimentaries={complimentaries}
                cafeteria={cafeteria}
                onAddOrUpdateRecipe={async (recipe) => pushItem('menu-costing-recipes', recipe)}
                onAddOrUpdateProduction={async (prod) => pushItem('productions', prod)}
                onAddOrUpdateRnd={async (rnd) => pushItem('rnd-logs', rnd)}
                onAddOrUpdateComplimentary={async (comp) => pushItem('complimentaries', comp)}
                onAddOrUpdateCafeteria={async (caf) => pushItem('cafeteria-reports', caf)}
                onAddOrUpdateInventory={async (item) => pushItem('inventory', item)}
                onAddOrUpdatePurchase={async (purchase) => pushItem('direct-purchases', purchase)}
                formatMoney={formatMoney}
              />
            </div>
          )}

          {/* VIEWPORT: FINANCIAL BUDGETS & PROFIT AND LOSSES */}
          {activeView === 'budget' && (
            <div className="space-y-4">
              <BudgetAndPnLReportsComponent
                currentUser={currentUser}
                activeBranch={activeBranch}
                branches={branches}
                sales={sales}
                directPurchases={directPurchases}
                budgets={budgets}
                onSaveBudget={async (budget) => pushItem('budgets', budget)}
                formatMoney={formatMoney}
              />
            </div>
          )}

          {/* VIEWPORT: ATTENDANCE */}
          {activeView === 'attendance' && (
            <div className="space-y-4">
              <div className="border-b pb-2 flex justify-between items-center text-xs">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-gray-800">
                    ⏰ Time Clock System & Monthly Loans Amortization
                  </h2>
                  <p className="text-[10px] text-gray-400">Integrated attendance reports tracking company cash advances</p>
                </div>
              </div>

              {/* HR Module Sub-tabs */}
              <div className="flex space-x-2 border-b">
                <button
                  onClick={() => setAttendanceSubTab('attendance')}
                  className={`pb-2 px-4 font-black uppercase tracking-wider text-[11px] transition ${
                    attendanceSubTab === 'attendance'
                      ? 'border-b-2 border-blue-600 text-blue-800 font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ⏰ Attendance & Loans Logs
                </button>
                <button
                  onClick={() => setAttendanceSubTab('employees')}
                  className={`pb-2 px-4 font-black uppercase tracking-wider text-[11px] transition ${
                    attendanceSubTab === 'employees'
                      ? 'border-b-2 border-blue-600 text-blue-800 font-bold'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  👥 Employee Management Directory
                </button>
              </div>

              {attendanceSubTab === 'attendance' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const uId = (form.elements.namedItem('attUser') as HTMLSelectElement).value;
                      const hours = Number((form.elements.namedItem('attHours') as HTMLInputElement).value);
                      const over = Number((form.elements.namedItem('attOT') as HTMLInputElement).value);
                      const loan = Number((form.elements.namedItem('attLoan') as HTMLInputElement).value);

                      const attRecord: AttendanceRecord = {
                        id: `att-${Date.now()}`,
                        date: new Date().toISOString().slice(0, 10),
                        userId: uId,
                        clockIn: new Date().toISOString(),
                        hoursWorked: hours,
                        overtimeHours: over,
                        loansDeducted: loan,
                        bonusHoliday: 0,
                      };

                      const success = await pushItem('attendance', attRecord);
                      if (success) {
                        form.reset();
                        alert("Attendance specs added under HR payroll logs.");
                      }
                    }}
                    className="bg-white rounded-lg border border-gray-300 p-4 shadow space-y-3"
                  >
                    <h3 className="text-sm font-extrabold uppercase text-blue-800">Log Daily Shift Hours</h3>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Select Employee Staff</label>
                      <select name="attUser" className="mt-1 w-full rounded border p-2 bg-white">
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName} ({u.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-1 grid-flow-row">
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Basic Hours</label>
                        <input type="number" name="attHours" defaultValue={8} required className="w-full border rounded mt-1 p-1 bg-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase">OT (Hours)</label>
                        <input type="number" name="attOT" defaultValue={0} required className="w-full border rounded mt-1 p-1 bg-white" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-500 uppercase">Loan Ded (₱)</label>
                        <input type="number" name="attLoan" defaultValue={0} required className="w-full border rounded mt-1 p-1 bg-white font-mono" />
                      </div>
                    </div>
                    <button type="submit" className="w-full rounded bg-blue-700 text-white font-bold p-2 text-xs uppercase hover:bg-blue-800">
                      Register Shift Ledger
                    </button>
                  </form>

                  <div className="md:col-span-2 bg-white rounded-lg border border-gray-300 p-4 shadow overflow-hidden">
                    <h3 className="text-xs font-black uppercase text-gray-700 border-b pb-1 mb-2">History logs</h3>
                    <div className="space-y-2 pr-1 max-h-60 overflow-y-auto">
                      {attendance.map((rec) => {
                        const matchedU = users.find((u) => u.id === rec.userId);
                        return (
                          <div key={rec.id} className="border-b pb-1.5 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-extrabold text-blue-900">{matchedU ? matchedU.fullName : 'Employee Staff'}</p>
                              <p className="text-[10px] text-gray-500 font-mono">Date: {rec.date} | Base: {rec.hoursWorked}h | OT: {rec.overtimeHours}h</p>
                            </div>
                            {rec.loansDeducted > 0 && (
                              <span className="font-mono text-red-650 font-bold bg-red-50 px-1 py-0.5 rounded">
                                Loan Ded: -{formatMoney(rec.loansDeducted)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 border rounded-xl shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-xs font-black uppercase text-blue-900">👥 Employee Staff Accounts roster</h3>
                    <p className="text-[10px] text-gray-400">Add, edit, lock accounts, manage and configure credentials below.</p>
                  </div>
                  <UserManagementComponent
                    currentUser={currentUser}
                    users={users}
                    branches={branches}
                    onAddOrUpdateUser={async (u) => {
                      return await pushItem('users', u);
                    }}
                    onDeleteUser={async (id) => {
                      return await deleteItem('users', id);
                    }}
                    taxInfo={taxInfo}
                    onSaveTaxInfo={async (info) => {
                      await pushItem('taxinfo', info);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* VIEWPORT: RESERVATIONS */}
          {activeView === 'reservations' && (
            <ReservationSystemComponent
              reservations={reservations}
              onAddReservation={async (res) => {
                return await pushItem('reservations', res);
              }}
              onDeleteReservation={async (id) => {
                return await deleteDoc(doc(db, 'reservations', id)).then(() => true).catch(() => false);
              }}
              currentUser={currentUser}
            />
          )}

          {/* VIEWPORT: CUSTOMERS */}
          {activeView === 'customers' && (
            <CustomerLoyaltyComponent
              customers={customers}
              sales={sales}
              onAddOrUpdateCustomer={async (cust) => {
                return await pushItem('customers', cust);
              }}
              formatMoney={formatMoney}
            />
          )}

          {/* VIEWPORT: BIR COMPLIANCE */}
          {activeView === 'bir' && (
            <BIRFormsComponent
              sales={sales}
              taxInfo={taxInfo}
              onSaveTaxInfo={async (info) => {
                await pushItem('taxinfo', info);
              }}
            />
          )}

          {/* VIEWPORT: WEDDINGS & CORPORATES EVENTS PACKAGE MANAGER */}
          {activeView === 'event-weddings' && (
            <EventModulesComponent
              weddings={weddings}
              corporates={corporates}
              onAddWedding={async (w) => {
                await pushItem('weddings', w);
              }}
              onAddCorporate={async (c) => {
                await pushItem('corporates', c);
              }}
              onDeleteWedding={async (id) => {
                await deleteItem('weddings', id);
              }}
              onDeleteCorporate={async (id) => {
                await deleteItem('corporates', id);
              }}
            />
          )}

          {/* VIEWPORT: USER MANAGEMENT WORKSPACE FOR ADMINS */}
          {activeView === 'users' && currentUser?.role === 'Admin' && (
            <UserManagementComponent
              currentUser={currentUser}
              users={users}
              branches={branches}
              onAddOrUpdateUser={async (u) => {
                return await pushItem('users', u);
              }}
              onDeleteUser={async (id) => {
                return await deleteItem('users', id);
              }}
              taxInfo={taxInfo}
              onSaveTaxInfo={async (info) => {
                await pushItem('taxinfo', info);
              }}
            />
          )}

        </main>
      </div>

      {/* 5. Footer Status Bar */}
      <footer className="flex h-8 w-full items-center justify-between border-t border-gray-300 bg-gray-800 px-4 text-[9px] font-bold text-white uppercase tracking-widest">
        <div className="flex items-center space-x-4">
          <span className="text-green-400">● {lex('serverOnline')}</span>
          <span>{lex('version')}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{lex('devOwner')}</span>
          <span className="bg-blue-700 px-2 py-1 select-none">© 2026 JCC Group</span>
        </div>
      </footer>

      {/* MODAL: POS CHECKOUT PANEL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider">
                POS Unified Payment Register
              </h3>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="text-gray-400 hover:text-black font-black text-xs"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-gray-700">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">👑 Select Loyalty VIP Member</label>
                <select
                  value={selectedLoyaltyCustId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedLoyaltyCustId(val);
                    if (val) {
                      const found = customers.find(c => c.id === val);
                      if (found) {
                        setCustomerName(found.fullName);
                      }
                    } else {
                      setCustomerName('');
                    }
                  }}
                  className="w-full rounded border border-gray-300 p-2 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Non-Member / Walk-In Guest --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.loyaltyCode} - {c.visits || 0} visits)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Customer name mapping</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded border p-1.5 mt-1"
                  placeholder="e.g. Maria Clara"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Total Pax</label>
                  <input
                    type="number"
                    value={paxTotalCount}
                    onChange={(e) => {
                      const v = Math.max(1, Number(e.target.value));
                      setPaxTotalCount(v);
                    }}
                    className="w-full rounded border p-1 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Senior / PWD Pax</label>
                  <input
                    type="number"
                    value={paxEligibleDiscount}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value));
                      setPaxEligibleDiscount(v);
                    }}
                    className="w-full rounded border p-1 mt-1 text-red-650"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded border p-2 mt-1 font-bold"
                >
                  <option value="Cash">Cash Drawer Outlay</option>
                  <option value="GCash">GCash Pinless Ledger</option>
                  <option value="PayMaya">PayMaya Ledger Info</option>
                </select>
              </div>

              {paymentMethod === 'Cash' ? (
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Exact Cash Amount Received (PHP)</label>
                  <input
                    type="number"
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    className="w-full rounded border p-2 mt-1 text-md font-mono font-black text-green-700"
                    placeholder="₱ 0.00"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">E-Wallet Trace Ref Number</label>
                  <input
                    type="text"
                    value={paymentRefNo}
                    onChange={(e) => setPaymentRefNo(e.target.value)}
                    className="w-full rounded border p-2 mt-1 font-mono"
                    placeholder="Ref-9921-2A"
                  />
                </div>
              )}

              {/* Math summaries */}
              <div className="bg-gray-100 p-3 rounded font-mono text-[11px] leading-relaxed space-y-1">
                <div className="flex justify-between">
                  <span>Cart Subtotal:</span>
                  <span>{formatMoney(computedCartSubtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Senior / PWD Deduction:</span>
                    <span>-{formatMoney(appliedDiscount)}</span>
                  </div>
                )}
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-indigo-700 font-bold">
                    <span>Loyalty VIP Off:</span>
                    <span>-{formatMoney(loyaltyDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-blue-900 border-t pt-1 border-dashed mt-1">
                  <span>Computed Net Invoice:</span>
                  <span>{formatMoney(computedNetTotal)}</span>
                </div>
                {paymentMethod === 'Cash' && Number(amountPaidInput) >= computedNetTotal && (
                  <div className="flex justify-between text-green-700 font-extrabold">
                    <span>Change Reconciled:</span>
                    <span>{formatMoney(Number(amountPaidInput) - computedNetTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 pt-1.5 select-none">
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="flex-1 rounded border border-gray-300 p-2 text-xs font-bold text-gray-700 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessSaleSubmit}
                className="flex-1 rounded bg-blue-700 p-2 text-xs font-black uppercase text-white hover:bg-blue-800 shadow"
              >
                Accept Order & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHIFT Z-READING CONSOLIDATION DETAIL */}
      {zReadingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-5 shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider">
                Shift End Official Z-Reading Report
              </h3>
              <button
                onClick={() => setZReadingShift(null)}
                className="text-gray-400 hover:text-black font-black text-xs"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-50 border p-3 font-serif text-[10px] leading-relaxed select-text tracking-wide whitespace-pre-line text-gray-800">
              <p className="text-center font-bold uppercase text-gray-900 text-xs">{taxInfo.businessName || "JCC Management Operations"}</p>
              <p className="text-center">Z-READING REPORT - BRANCH: {zReadingShift.branchId}</p>
              <div className="border-t my-1 border-dashed"></div>
              <p>Shift Unique ID: {zReadingShift.id}</p>
              <p>Cashier On Duty: {zReadingShift.cashierId}</p>
              <p>Start parameters: {formatDate(zReadingShift.startTime)}</p>
              {zReadingShift.endTime && <p>Reconciled Closes: {formatDate(zReadingShift.endTime)}</p>}
              <div className="border-t my-1 border-dashed"></div>
              <p><strong>REVENUE ACCUMULATION DETAILS</strong></p>
              <p>Opening Petty Cash Balance in Drawer: {formatMoney(zReadingShift.openingCash)}</p>
              <p>Deducted Drawer Outlay Expenses: -{formatMoney(zReadingShift.expensesLogged || 0)}</p>
              <p>Estimated Cash Net Sales inside shift: {formatMoney((zReadingShift.expectedCash || 0) + (zReadingShift.expensesLogged || 0) - zReadingShift.openingCash)}</p>
              <div className="border-t my-1 border-dashed"></div>
              <p className="font-extrabold text-blue-800">Expected Reconciled Cash Balance: {formatMoney(zReadingShift.expectedCash)}</p>
              {zReadingShift.closingCash && (
                <>
                  <p className="font-extrabold text-blue-800">Declared Actual Counted Cash: {formatMoney(zReadingShift.closingCash)}</p>
                  <p className={`font-black ${zReadingShift.variance && zReadingShift.variance >= 0 ? 'text-green-700' : 'text-red-650'}`}>
                    SHIFT RECONCILIATION VARIANCE: {formatMoney(zReadingShift.variance || 0)}
                  </p>
                </>
              )}
            </div>

            <button
               onClick={() => {
                 window.print();
                 setZReadingShift(null);
               }}
               className="w-full rounded bg-blue-700 p-2 text-xs font-black uppercase text-white hover:bg-blue-800"
            >
              Print Double Copies (Merchant + Customer)
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SECURITY VOID REQUEST WITH PIN AUTHORIZATION */}
      {voidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-300 bg-white p-5 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-xs font-black uppercase text-red-600 tracking-wider">
                🔒 Security Void Receipt Reversal
              </h3>
              <button
                onClick={() => setVoidModalOpen(false)}
                className="text-gray-400 hover:text-black font-black text-xs"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium text-gray-700">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Receipt Transaction ID</label>
                <input
                  type="text"
                  required
                  value={voidTxnId}
                  onChange={(e) => setVoidTxnId(e.target.value)}
                  className="w-full rounded border p-1.5 mt-1 font-mono text-center font-bold text-blue-800"
                  placeholder="e.g. txn-1001"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Reason for void request</label>
                <input
                  type="text"
                  required
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full rounded border p-1.5 mt-1"
                  placeholder="Reason (e.g., incorrect entry)"
                />
              </div>

              <div className="bg-red-50 p-2.5 rounded border border-red-200 text-[10px] text-red-800 leading-normal font-bold">
                ⚠️ NOTICE: Cashiers cannot void orders unilaterally. Voiding a transaction automatically reverts and updates standard inventory ingredient levels.
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
                  Manager Authorization Security Key PIN
                </label>
                <input
                  type="password"
                  value={voidManagerPin}
                  onChange={(e) => setVoidManagerPin(e.target.value)}
                  className="w-full rounded border p-2 text-center text-md font-mono tracking-widest font-black text-red-650"
                  placeholder="Manager PIN (e.g. 2222)"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-1.5">
              <button
                onClick={() => setVoidModalOpen(false)}
                className="flex-1 rounded border border-gray-300 p-2 text-xs font-bold text-gray-700 uppercase"
              >
                Cancel
              </button>
              <button
                onClick={executeVoid}
                className="flex-1 rounded bg-red-600 p-2 text-xs font-black uppercase text-white hover:bg-red-700 shadow"
              >
                Authenticate Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
