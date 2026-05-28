import React, { useState } from 'react';
import { 
  User, 
  MenuCostingRecipe, 
  InventoryItem, 
  DirectPurchase, 
  ProductionReport, 
  RndLog, 
  ComplimentaryLog, 
  CafeteriaReport 
} from '../types';
import { 
  Utensils, 
  FileSpreadsheet, 
  Scaling, 
  BookOpen, 
  TrendingUp, 
  Flame, 
  Plus, 
  Save, 
  Printer, 
  Camera, 
  Activity, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  Calculator,
  Compass,
  Gift,
  Coffee,
  Database
} from 'lucide-react';

interface CommissaryProductionProps {
  currentUser: User;
  activeBranch: string;
  inventory: InventoryItem[];
  directPurchases: DirectPurchase[];
  menuCostingRecipes: MenuCostingRecipe[];
  productions: ProductionReport[];
  rndLogs: RndLog[];
  complimentaries: ComplimentaryLog[];
  cafeteria: CafeteriaReport[];
  onAddOrUpdateRecipe: (recipe: MenuCostingRecipe) => Promise<boolean>;
  onAddOrUpdateProduction: (prod: ProductionReport) => Promise<boolean>;
  onAddOrUpdateRnd: (rnd: RndLog) => Promise<boolean>;
  onAddOrUpdateComplimentary: (comp: ComplimentaryLog) => Promise<boolean>;
  onAddOrUpdateCafeteria: (caf: CafeteriaReport) => Promise<boolean>;
  onAddOrUpdateInventory: (item: InventoryItem) => Promise<boolean>;
  onAddOrUpdatePurchase: (purchase: DirectPurchase) => Promise<boolean>;
  formatMoney: (val: number) => string;
}

export const CommissaryProductionComponent: React.FC<CommissaryProductionProps> = ({
  currentUser,
  activeBranch,
  inventory,
  directPurchases,
  menuCostingRecipes,
  productions,
  rndLogs,
  complimentaries,
  cafeteria,
  onAddOrUpdateRecipe,
  onAddOrUpdateProduction,
  onAddOrUpdateRnd,
  onAddOrUpdateComplimentary,
  onAddOrUpdateCafeteria,
  onAddOrUpdateInventory,
  onAddOrUpdatePurchase,
  formatMoney,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'engineering' | 'production' | 'rnd' | 'complimentary' | 'cafeteria'>('directory');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1-WEEK DIRECT PURCHASE WEIGHTED COST CALCULATION ENGINE
  // "costing based on the updated pricing of raw ingredients or materials 1 week in the inputted data in direct purchases."
  const getIngredientCostBasis = (ingName: string, defaultCost: number): number => {
    // Find all direct purchases received in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const matchPurchases = directPurchases.filter(po => {
      if (po.status !== 'Received') return false;
      const poDate = new Date(po.date);
      return poDate >= oneWeekAgo;
    });

    // Look for matching ingredient name in PO lines
    let totalQty = 0;
    let totalCostVal = 0;

    for (const po of matchPurchases) {
      for (const item of po.items) {
        if (item.name.toLowerCase() === ingName.toLowerCase() || ingName.toLowerCase().includes(item.name.toLowerCase())) {
          totalQty += Number(item.qty);
          totalCostVal += (Number(item.qty) * Number(item.unitPrice));
        }
      }
    }

    if (totalQty > 0) {
      const avgPrice = totalCostVal / totalQty;
      return avgPrice;
    }
    return defaultCost; // fallback to inventory default cost if no purchase logged last week
  };

  // ==========================================
  // SUBTAB 1: RECIPE DIRECTORY / MENU COSTING
  // ==========================================
  const [selectedRecipe, setSelectedRecipe] = useState<MenuCostingRecipe | null>(null);
  const [isCreatingRecipe, setIsCreatingRecipe] = useState(false);

  // Form parameters
  const [recName, setRecName] = useState('');
  const [recCode, setRecCode] = useState('');
  const [recCat, setRecCat] = useState('Ala Carte');
  const [recYield, setRecYield] = useState(1);
  const [recPortionSize, setRecPortionSize] = useState('1 serving');
  const [recMeatWt, setRecMeatWt] = useState(0);
  const [recVegWt, setRecVegWt] = useState(0);
  const [recSauceWt, setRecSauceWt] = useState(0);
  const [recMarginPct, setRecMarginPct] = useState(35); // standard food cost margin target
  const [recFinalPrice, setRecFinalPrice] = useState(0);
  const [recProcedure, setRecProcedure] = useState('');
  const [recPhotoUrl, setRecPhotoUrl] = useState('');
  const [recSignChef, setRecSignChef] = useState('Chef Michael Llena');
  const [recSignApproved1, setRecSignApproved1] = useState('Chef Michael Llena');

  // Recipe ingredients lines
  const [recIngLines, setRecIngLines] = useState<{ ingredientId: string; weightStandard: number; recoveryPct: number }[]>([
    { ingredientId: '', weightStandard: 100, recoveryPct: 100 }
  ]);

  const handleCalculateRecipeCogs = (ingList: typeof recIngLines): number => {
    return ingList.reduce((sum, line) => {
      const parentInv = inventory.find(i => i.id === line.ingredientId);
      if (!parentInv) return sum;
      const latestWeeklyCost = getIngredientCostBasis(parentInv.name, parentInv.unitCost);
      // Cost adjusted for waste recovery percentage (e.g., if recovery is 80%, effective weight needed is higher)
      const effectiveFactor = line.recoveryPct > 0 ? (100 / line.recoveryPct) : 1;
      const costForLine = (latestWeeklyCost * (line.weightStandard / 1000)) * effectiveFactor;
      return sum + costForLine;
    }, 0);
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!recName.trim() || !recCode.trim()) {
      setErrorMsg('Ensure Name & Recipe Codes are filled.');
      return;
    }

    try {
      const computedCOGS = handleCalculateRecipeCogs(recIngLines);
      // recommended selling price based on Food Cost Margin Percentage Target e.g., default 35% margin
      // Price = COGS / (Margin % / 100)
      const foodCostFactor = recMarginPct > 0 ? (recMarginPct / 100) : 0.35;
      const recommendedPrice = computedCOGS / foodCostFactor;

      const payload: MenuCostingRecipe = {
        id: selectedRecipe?.id || `mcr-${Date.now()}`,
        name: recName.trim(),
        recipeCode: recCode.trim().toUpperCase(),
        category: recCat,
        yieldPax: recYield,
        portionSize: recPortionSize,
        meatWeight: recMeatWt,
        vegWeight: recVegWt,
        sauceWeight: recSauceWt,
        shrinkagePct: 10,
        prepTime: '20 mins',
        cookingTime: '30 mins',
        procedure: recProcedure,
        laborCost30: computedCOGS * 0.3,
        opex30: computedCOGS * 0.3,
        vat12: computedCOGS * 0.12,
        cogs: computedCOGS,
        foodCost: computedCOGS,
        foodCostPercentage: recMarginPct,
        profit: (recFinalPrice || recommendedPrice) - computedCOGS,
        recommendedPrice: recommendedPrice,
        finalPrice: recFinalPrice || recommendedPrice,
        ingredients: recIngLines.map(line => {
          const parentInv = inventory.find(i => i.id === line.ingredientId);
          return {
            ingredientId: line.ingredientId,
            weightStandard: line.weightStandard,
            weightActual: line.weightStandard,
            unitPrice: parentInv ? parentInv.unitCost : 0,
            recoveryPct: line.recoveryPct,
            desc: parentInv ? parentInv.name : ''
          };
        }),
        allergens: ['None'],
        equipments: ['Standard Kitchen range'],
        signatoryChef: recSignChef,
        signatoryApproved1: recSignApproved1,
        photoUrl: recPhotoUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60'
      };

      const ok = await onAddOrUpdateRecipe(payload);
      if (ok) {
        setSuccessMsg(`Successfully saved Recipe Standard "${recName}" into system.`);
        setSelectedRecipe(null);
        setIsCreatingRecipe(false);
      } else {
        setErrorMsg('Error committing recipe specs to backend.');
      }
    } catch (err) {
      setErrorMsg('Stall on database save.');
    }
  };

  // ==========================================
  // SUBTAB 2: MENU ENGINEERING & SCALE CALCULATOR
  // ==========================================
  const [engRecipeId, setEngRecipeId] = useState('');
  const [engPaxCount, setEngPaxCount] = useState(100);
  const [engActualUsageLogged, setEngActualUsageLogged] = useState(false);

  const handleGenerateDirectPurchaseForScaledRecipe = async (recipe: MenuCostingRecipe, pCount: number) => {
    try {
      setSuccessMsg('');
      setErrorMsg('');

      const scaleFactor = pCount / recipe.yieldPax;
      
      // Calculate scaled raw ingredients quantities
      const purchaseLines = recipe.ingredients.map(line => {
        const parentInv = inventory.find(i => i.id === line.ingredientId);
        const neededQtyGrams = line.weightStandard * scaleFactor;
        const neededQtyKg = Number((neededQtyGrams / 1000).toFixed(2));

        return {
          name: line.desc || parentInv?.name || 'Raw Ingredient',
          qty: neededQtyKg > 0 ? neededQtyKg : 1,
          unit: 'kg',
          unitPrice: parentInv ? parentInv.unitCost : 50,
          total: (neededQtyKg > 0 ? neededQtyKg : 1) * (parentInv ? parentInv.unitCost : 50)
        };
      });

      const totalValue = purchaseLines.reduce((s, item) => s + item.total, 0);

      // Create Pending Direct Purchase request specifically for Kitchen/Commissary department
      const poPayload: DirectPurchase = {
        id: `dp-scale-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        dateTime: new Date().toISOString(),
        supplierName: 'System Menu Engineering Auto Requisition',
        supplierBrand: 'SYS RECIPE SCALE',
        contactInfo: 'N/A',
        address: 'Main Storehouse',
        tin: '992-120-111-000',
        orSiNo: `SCALE-PO-${Date.now().toString().slice(-4)}`,
        pcvNo: `PV-SCALE-${Date.now().toString().slice(-4)}`,
        department: 'Commissary',
        branchId: activeBranch,
        items: purchaseLines,
        totalAmount: totalValue,
        status: 'Pending' // Requires Admin approval override!
      };

      const ok = await onAddOrUpdatePurchase(poPayload);
      if (ok) {
        setSuccessMsg(`Fabulous! Generated dynamic Direct Purchase Request PO #${poPayload.orSiNo} for kitchen stocking base. Active alarm triggered!`);
      } else {
        setErrorMsg('Error generating scaled purchase request.');
      }
    } catch (e) {
      setErrorMsg('Failure generating scaling orders.');
    }
  };

  // Recipe-Based Deduction on Production execution
  const executeActualProductionDeduction = async (recipe: MenuCostingRecipe, pCount: number) => {
    try {
      setSuccessMsg('');
      setErrorMsg('');

      const scaleFactor = pCount / recipe.yieldPax;

      for (const line of recipe.ingredients) {
        const matchingItem = inventory.find(i => i.id === line.ingredientId);
        if (!matchingItem) continue;

        // compute subtraction (standard weight in grams converted to kg * scaling factor)
        const deductionAmountKg = (line.weightStandard / 1000) * scaleFactor;
        const finalQtyOnHand = Math.max(0, matchingItem.quantity - deductionAmountKg);

        const updated: InventoryItem = {
          ...matchingItem,
          quantity: Number(finalQtyOnHand.toFixed(3))
        };
        await onAddOrUpdateInventory(updated);
      }

      // Record production report history log
      const totalCOGSValue = recipe.cogs * scaleFactor;
      const rLog: ProductionReport = {
        id: `prod-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        recipeId: recipe.id,
        paxCount: pCount,
        totalCost: totalCOGSValue,
        type: 'Commissary'
      };

      await onAddOrUpdateProduction(rLog);

      setSuccessMsg(`Production success! Prepared ${pCount} pax of "${recipe.name}". Dynamically subtracted all corresponding ingredients from general inventory ledger.`);
    } catch (e) {
      setErrorMsg('Error completing production inventory deduction.');
    }
  };


  // ==========================================
  // SUBTAB 3: RESEARCH & DEVELOPMENT (R&D) LOGS
  // ==========================================
  const [rndMenuName, setRndMenuName] = useState('');
  const [rndIngId, setRndIngId] = useState('');
  const [rndIngQty, setRndIngQty] = useState(0);
  const [rndFindings, setRndFindings] = useState('');

  const handleSaveRndLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!rndMenuName.trim() || !rndIngId || rndIngQty <= 0) {
      setErrorMsg('Please specify Recipe trial name and ingredients.');
      return;
    }

    try {
      // Deduct from Stock
      const matching = inventory.find(i => i.id === rndIngId);
      if (!matching) {
        setErrorMsg('Inventory stock not found.');
        return;
      }

      if (matching.quantity < rndIngQty) {
        setErrorMsg(`Insufficient stock hand for trial. Only ${matching.quantity} ${matching.unit} left.`);
        return;
      }

      // Subtract
      const updatedStock: InventoryItem = {
        ...matching,
        quantity: Number((matching.quantity - rndIngQty).toFixed(2))
      };
      await onAddOrUpdateInventory(updatedStock);

      const computedLineCost = matching.unitCost * rndIngQty;

      const payload: RndLog = {
        id: `rnd-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        menuName: rndMenuName.trim(),
        ingredientsUsed: [{
          ingredientId: rndIngId,
          quantity: rndIngQty,
          cost: computedLineCost
        }],
        totalCost: computedLineCost,
        findings: rndFindings || 'Tasted good, needs slight salt reduction.'
      };

      const ok = await onAddOrUpdateRnd(payload);
      if (ok) {
        setSuccessMsg(`Logged R&D prototype trial for "${rndMenuName}". Deducted ingredients from workspace stocks.`);
        setRndMenuName('');
        setRndFindings('');
        setRndIngQty(0);
      }
    } catch (e) {
      setErrorMsg('Error filing experimental mock trial.');
    }
  };


  // ==========================================
  // SUBTAB 4: COMPLIMENTARY FOOD SET UP
  // ==========================================
  const [compDept, setCompDept] = useState('FnB Restaurant');
  const [compName, setCompName] = useState('');
  const [compQty, setCompQty] = useState(1);
  const [compValue, setCompValue] = useState(0);
  const [compNotes, setCompNotes] = useState('');

  const handleSaveComplimentary = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!compName.trim() || compQty <= 0 || compValue <= 0) {
      setErrorMsg('Please fill in complete item credentials.');
      return;
    }

    try {
      const payload: ComplimentaryLog = {
        id: `comp-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        department: compDept,
        itemName: compName.trim(),
        qty: compQty,
        value: compValue * compQty,
        notes: compNotes || 'Marketing partner sampling'
      };

      const ok = await onAddOrUpdateComplimentary(payload);
      if (ok) {
        setSuccessMsg(`Filer Complimentary distribution under department list cost of: "${compDept}".`);
        setCompName('');
        setCompQty(1);
        setCompValue(0);
        setCompNotes('');
      }
    } catch (e) {
      setErrorMsg('Filer failure.');
    }
  };


  // ==========================================
  // SUBTAB 5: CAFETERIA STAFF MEAL LOGS
  // ==========================================
  const [cafMeal, setCafMeal] = useState('');
  const [cafPax, setCafPax] = useState(30);
  const [cafCost, setCafCost] = useState(1500);

  const handleSaveCafeteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!cafMeal.trim() || cafPax <= 0) {
      setErrorMsg('Meal name and count are mandatory.');
      return;
    }

    try {
      const payload: CafeteriaReport = {
        id: `caf-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        mealName: cafMeal.trim(),
        paxServed: cafPax,
        totalCost: cafCost
      };

      const ok = await onAddOrUpdateCafeteria(payload);
      if (ok) {
        setSuccessMsg(`Filer staff cafeteria record for: ${cafPax} headcount lunch served.`);
        setCafMeal('');
        setCafCost(1500);
      }
    } catch (e) {
      setErrorMsg('E-saving cafeterias error.');
    }
  };

  return (
    <div className="space-y-4 font-bold text-xs">
      
      {/* Sub tabs Menu */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => { setActiveTab('directory'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-4 uppercase font-black tracking-wider transition ${
            activeTab === 'directory' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          📖 Recipe costing Book
        </button>
        <button
          onClick={() => { setActiveTab('engineering'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-4 uppercase font-black tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'engineering' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Scaling size={13} /> Menu Engineering & scale
        </button>
        <button
          onClick={() => { setActiveTab('production'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-4 uppercase font-black tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'production' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Database size={13} /> Commissary Reports
        </button>
        <button
          onClick={() => { setActiveTab('rnd'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-4 uppercase font-black tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'rnd' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Compass size={13} /> Research & Development (R&D)
        </button>
        <button
          onClick={() => { setActiveTab('complimentary'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-4 uppercase font-black tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'complimentary' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Gift size={13} /> Complimentary Log
        </button>
        <button
          onClick={() => { setActiveTab('cafeteria'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-4 uppercase font-black tracking-wider transition flex items-center gap-1.5 ${
            activeTab === 'cafeteria' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Coffee size={13} /> Staff Cafeteria
        </button>
      </div>

      {successMsg && <p className="text-[10px] text-emerald-800 font-extrabold uppercase bg-emerald-50 border border-emerald-300 p-2 rounded">{successMsg}</p>}
      {errorMsg && <p className="text-[10px] text-red-800 font-extrabold uppercase bg-red-50 border border-red-350 p-2 rounded">{errorMsg}</p>}

      {/* SUBTAB 1: RECIPE COSTING DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Portion: Recipe Listing Grid */}
          <div className="lg:col-span-4 bg-white p-4 border border-gray-300 rounded-lg shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-1.5">
              <span className="text-[10px] font-black uppercase text-gray-400">RECIPE DICTIONARIES</span>
              <button
                onClick={() => {
                  setSelectedRecipe(null);
                  setRecName('');
                  setRecCode('');
                  setRecProcedure('');
                  setRecFinalPrice(0);
                  setIsCreatingRecipe(true);
                }}
                className="bg-blue-700 text-white px-2 py-1 rounded text-[9px] uppercase font-black"
              >
                + New Recipe
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {menuCostingRecipes.map(recipe => {
                return (
                  <div 
                    key={recipe.id}
                    onClick={() => {
                      setSelectedRecipe(recipe);
                      setRecName(recipe.name);
                      setRecCode(recipe.recipeCode);
                      setRecCat(recipe.category);
                      setRecYield(recipe.yieldPax);
                      setRecPortionSize(recipe.portionSize);
                      setRecMeatWt(recipe.meatWeight || 0);
                      setRecVegWt(recipe.vegWeight || 0);
                      setRecSauceWt(recipe.sauceWeight || 0);
                      setRecProcedure(recipe.procedure);
                      setRecFinalPrice(recipe.finalPrice);
                      setRecPhotoUrl(recipe.photoUrl || '');
                      setRecIngLines(recipe.ingredients.map(i => ({
                        ingredientId: i.ingredientId,
                        weightStandard: i.weightStandard,
                        recoveryPct: i.recoveryPct
                      })));
                      setIsCreatingRecipe(false);
                    }}
                    className={`border border-gray-200 rounded p-2.5 cursor-pointer transition ${
                      selectedRecipe?.id === recipe.id ? 'bg-blue-50 border-blue-400' : 'bg-gray-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex justify-between font-black text-xs text-gray-950 uppercase">
                      <span>{recipe.name}</span>
                      <span className="text-[9px] bg-gray-200 px-1.5 rounded">{recipe.recipeCode}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-none">Yield: {recipe.yieldPax} Pax | Target Cost: {formatMoney(recipe.cogs)}</p>
                    <p className="text-[10px] text-blue-900 font-extrabold uppercase mt-2">Final Price: {formatMoney(recipe.finalPrice)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Portion: Viewing or Creating/Editing standard specification sheets */}
          <div className="lg:col-span-8 bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
            {isCreatingRecipe || selectedRecipe ? (
              <form onSubmit={handleSaveRecipe} className="space-y-4">
                <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-1.5">
                  {isCreatingRecipe ? 'CREATE NEW RECIPE COSTING CARD' : `SPECIFICATIONS: STANDARD QUANTITIES FOR "${selectedRecipe?.name}"`}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Recipe Name</label>
                    <input 
                      type="text"
                      value={recName}
                      onChange={(e) => setRecName(e.target.value)}
                      placeholder="Espresso Latte"
                      className="w-full rounded border p-1.5 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Recipe Code ID</label>
                    <input 
                      type="text"
                      value={recCode}
                      onChange={(e) => setRecCode(e.target.value)}
                      placeholder="LAT-01"
                      className="w-full rounded border p-1.5 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Yield pax Headcount</label>
                    <input 
                      type="number"
                      value={recYield || ''}
                      onChange={(e) => setRecYield(Number(e.target.value))}
                      className="w-full rounded border p-1.5 font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Portion Unit Descriptor</label>
                    <input 
                      type="text"
                      value={recPortionSize}
                      onChange={(e) => setRecPortionSize(e.target.value)}
                      placeholder="1 Big Cup"
                      className="w-full rounded border p-1.5 font-bold"
                    />
                  </div>
                </div>

                {/* Sub-components metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-gray-50 p-2.5 rounded border">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Standard Meat weight (g)</label>
                    <input 
                      type="number"
                      value={recMeatWt || ''}
                      onChange={(e) => setRecMeatWt(Number(e.target.value))}
                      className="w-full rounded border p-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Veggie contents (g)</label>
                    <input 
                      type="number"
                      value={recVegWt || ''}
                      onChange={(e) => setRecVegWt(Number(e.target.value))}
                      className="w-full rounded border p-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Sauce basis weight (g)</label>
                    <input 
                      type="number"
                      value={recSauceWt || ''}
                      onChange={(e) => setRecSauceWt(Number(e.target.value))}
                      className="w-full rounded border p-1 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Photo Preset URL</label>
                    <input 
                      type="text"
                      value={recPhotoUrl}
                      onChange={(e) => setRecPhotoUrl(e.target.value)}
                      placeholder="URL string"
                      className="w-full rounded border p-1 text-[10px]"
                    />
                  </div>
                </div>

                {/* Ingredients composition block */}
                <div className="border border-gray-200 rounded p-2.5 bg-gray-55/30 space-y-1.5">
                  <div className="flex justify-between items-center border-b pb-0.5 text-[10.5px]">
                    <span className="text-[10px] font-extrabold uppercase text-blue-900 tracking-wider">RAW MATERIAL RECOVERY INGREDIENTS SETTINGS</span>
                    <button
                      type="button"
                      onClick={() => setRecIngLines([...recIngLines, { ingredientId: '', weightStandard: 100, recoveryPct: 100 }])}
                      className="text-[9px] bg-blue-150 text-blue-900 border px-2 rounded font-black"
                    >
                      + Add Item line
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {recIngLines.map((line, idx) => (
                      <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="block text-[7.5px] uppercase font-black text-gray-400">Select stock ingredient</label>
                          <select
                            value={line.ingredientId}
                            onChange={(e) => {
                              const updated = [...recIngLines];
                              updated[idx].ingredientId = e.target.value;
                              setRecIngLines(updated);
                            }}
                            className="w-full text-[11px] rounded border p-1 font-bold bg-white"
                          >
                            <option value="">-- select raw spec --</option>
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="block text-[7.5px] uppercase font-black text-gray-400">Unit Standard weight (g)</label>
                          <input 
                            type="number"
                            value={line.weightStandard || ''}
                            onChange={(e) => {
                              const updated = [...recIngLines];
                              updated[idx].weightStandard = Number(e.target.value);
                              setRecIngLines(updated);
                            }}
                            className="w-full text-center text-[11px] rounded border p-1 font-mono font-bold"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[7.5px] uppercase font-black text-gray-400">Waste Recovery %</label>
                          <input 
                            type="number"
                            value={line.recoveryPct || ''}
                            onChange={(e) => {
                              const updated = [...recIngLines];
                              updated[idx].recoveryPct = Number(e.target.value);
                              setRecIngLines(updated);
                            }}
                            className="w-full text-center text-[11px] rounded border p-1 font-mono font-bold text-green-700"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (recIngLines.length <= 1) return;
                            setRecIngLines(recIngLines.filter((_, i) => i !== idx));
                          }}
                          className="bg-red-50 text-red-650 p-1 border rounded"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded border">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Food Cost Margin Target %</label>
                    <input 
                      type="number"
                      value={recMarginPct || ''}
                      onChange={(e) => setRecMarginPct(Number(e.target.value))}
                      className="w-full rounded border p-1 font-mono text-center font-bold text-indigo-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Calculated COGS (Latest Direct Pricing)</label>
                    <div className="p-1 font-mono font-black text-xs text-blue-900">
                      {formatMoney(handleCalculateRecipeCogs(recIngLines))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Final Selling Price (PHP)</label>
                    <input 
                      type="number"
                      value={recFinalPrice || ''}
                      onChange={(e) => setRecFinalPrice(Number(e.target.value))}
                      className="w-full rounded border p-1 font-bold font-mono text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Procedural & Standard Preparation cooking guide</label>
                  <textarea
                    rows={2}
                    value={recProcedure}
                    onChange={(e) => setRecProcedure(e.target.value)}
                    className="w-full rounded border p-2"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-900 hover:bg-black text-white font-black py-2 rounded text-xs uppercase"
                  >
                    💾 Confirm & Lock parameters
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedRecipe(null); setIsCreatingRecipe(false); }}
                    className="w-24 bg-gray-250 text-gray-700 py-2 border rounded"
                  >
                    Close
                  </button>
                </div>
              </form>
            ) : (
              <div className="border border-dashed p-12 text-center text-gray-400 uppercase tracking-widest font-black text-[10px]">
                Select any recipe card standard specifications on left to print or override parameters
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUBTAB 2: MENU ENGINEERING & SCALE CALCULATOR */}
      {activeTab === 'engineering' && (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-4">
          <div className="border-b pb-2 flex justify-between items-center bg-gray-50 p-2 text-xs">
            <div>
              <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1">
                <Scaling size={16} /> STANDARD QUANTITIES PAX SCALING MULTIPLICATION SYSTEM
              </h3>
              <p className="text-[9px] text-gray-400 uppercase font-black">Input PAX target to multiply the recipe requirements, then dynamically deduct stock levels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-bold text-xs text-gray-800">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Choose target menu to scale</label>
              <select
                value={engRecipeId}
                onChange={(e) => {
                  setEngRecipeId(e.target.value);
                  setEngActualUsageLogged(false);
                }}
                className="w-full rounded border p-1.5 bg-white font-black"
              >
                <option value="">-- Choose standard recipe card --</option>
                {menuCostingRecipes.map(recipe => (
                  <option key={recipe.id} value={recipe.id}>{recipe.name} ({recipe.recipeCode})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Multiplier pax Servings Goal</label>
              <input 
                type="number"
                value={engPaxCount || ''}
                onChange={(e) => setEngPaxCount(Number(e.target.value))}
                className="w-full rounded border p-1.5 font-mono font-bold"
                placeholder="100"
              />
            </div>
          </div>

          {engRecipeId ? (
            (() => {
              const r = menuCostingRecipes.find(item => item.id === engRecipeId);
              if (!r) return null;

              const scaleFactor = engPaxCount / r.yieldPax;
              const totalCostVal = r.cogs * scaleFactor;

              return (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-55/40 space-y-4">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <h4 className="text-sm font-black text-gray-950 uppercase">{r.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Standard Yield: <b className="text-gray-900">{r.yieldPax} pax</b> | Scaled up to: <b className="text-blue-950 font-black">{engPaxCount} pax</b> (scale factor: {scaleFactor.toFixed(2)})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] bg-indigo-150 text-indigo-800 font-extrabold uppercase px-2 py-0.5 block rounded">CONSOLIDATED MULTIPLIED COGS</span>
                      <b className="font-mono text-base text-indigo-900 leading-none">{formatMoney(totalCostVal)}</b>
                    </div>
                  </div>

                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest pb-1 border-b border-dashed">Multiplied Ingredients Requirements details (grams adjusted):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {r.ingredients.map((line, idx) => {
                      const baseWt = line.weightStandard;
                      const scaledWtGrams = baseWt * scaleFactor;
                      const parentInv = inventory.find(i => i.id === line.ingredientId);
                      const isLow = parentInv ? (parentInv.quantity < (scaledWtGrams / 1000)) : false;

                      return (
                        <div key={idx} className={`bg-white p-2 border rounded-lg shadow-2xs space-y-1 ${isLow ? 'border-red-300 bg-red-50/20' : 'border-gray-200'}`}>
                          <p className="text-[10.5px] text-gray-950 truncate">{line.desc || parentInv?.name || 'Item spec'}</p>
                          <div className="flex justify-between items-baseline font-mono text-xs">
                            <span className="font-black text-blue-900">{(scaledWtGrams / 1000).toFixed(2)} kg</span>
                            <span className="text-[9px] text-gray-400">({scaledWtGrams.toFixed(0)}g)</span>
                          </div>
                          {parentInv && (
                            <p className="text-[9px] leading-none text-gray-400 uppercase">OnHand stock: {parentInv.quantity} {parentInv.unit}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t mt-4 border-dashed">
                    <button
                      type="button"
                      onClick={() => handleGenerateDirectPurchaseForScaledRecipe(r, engPaxCount)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2 px-5 rounded shadow uppercase flex items-center gap-1 transition"
                    >
                      <Calculator size={13} /> Generate Requisition PO & Trigger alarm notifications
                    </button>

                    <button
                      type="button"
                      disabled={engActualUsageLogged}
                      onClick={() => {
                        executeActualProductionDeduction(r, engPaxCount);
                        setEngActualUsageLogged(true);
                      }}
                      className={`font-black text-xs py-2 px-5 rounded shadow uppercase flex items-center gap-1 transition ${
                        engActualUsageLogged 
                          ? 'bg-gray-200 text-gray-450 border cursor-not-allowed' 
                          : 'bg-green-700 hover:bg-green-800 text-white'
                      }`}
                    >
                      <CheckCircle size={13} /> Log Actual usage & Deduct ledger stock
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-center text-gray-400 uppercase italic font-bold">Please pick standard specification recipes to initiate scale calculations.</p>
          )}

        </div>
      )}

      {/* SUBTAB 3: COMMISSARY REPORTS HISTORY */}
      {activeTab === 'production' && (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-4 text-xs font-semibold text-gray-700">
          <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider">
            COMMISSARY WORKSPACE PRODUCTION COMPLETED REGISTER HISTORIES
          </h3>

          <div className="bg-white border rounded overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-[9.5px] font-black uppercase text-gray-500 tracking-wider border-b">
                <tr>
                  <th className="p-2.5">Production date</th>
                  <th className="p-2.5">Standard Recipe code</th>
                  <th className="p-2.5">Category Class</th>
                  <th className="p-2.5 text-center">headcount Pax Servings</th>
                  <th className="p-2.5 text-right font-black">COGS Value deducted</th>
                  <th className="p-2.5 text-center">Status Index</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold text-gray-700 uppercase">
                {productions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400 italic">No batches finished inside workspace.</td>
                  </tr>
                ) : (
                  productions.map(log => {
                    const matchedRecipe = menuCostingRecipes.find(r => r.id === log.recipeId);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="p-2 font-mono text-[10px] text-gray-400">{log.date}</td>
                        <td className="p-2 font-black text-gray-900">{matchedRecipe ? matchedRecipe.name : 'Unknown Recipe'}</td>
                        <td className="p-2 text-indigo-750">{log.type} Model</td>
                        <td className="p-2 text-center font-mono font-bold text-indigo-900">{log.paxCount} Pax</td>
                        <td className="p-2 text-right font-mono text-gray-950 font-black">{formatMoney(log.totalCost)}</td>
                        <td className="p-2 text-center">
                          <span className="bg-green-100 text-green-800 text-[8px] tracking-wide font-black px-1.5 py-0.5 rounded uppercase">Deduction-Ok</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: RESEARCH & DEVELOPMENT (R&D) */}
      {activeTab === 'rnd' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Trial form */}
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-2 flex items-center gap-1.5">
              <Compass size={15} /> Log Trial specifications
            </h3>

            <form onSubmit={handleSaveRndLog} className="space-y-4">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Menu Creation R&D Trial Name</label>
                <input 
                  type="text"
                  required
                  value={rndMenuName}
                  onChange={(e) => setRndMenuName(e.target.value)}
                  placeholder="e.g., Trial Spicy Honey Adobo (v1)"
                  className="w-full rounded border p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Trial Stock Ingredient</label>
                  <select
                    value={rndIngId}
                    onChange={(e) => setRndIngId(e.target.value)}
                    className="w-full rounded border p-1.5 bg-white text-xs"
                  >
                    <option value="">-- Select --</option>
                    {inventory.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.name} (OnHand: {inv.quantity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Subtracted Trial weight/qty</label>
                  <input 
                    type="number"
                    value={rndIngQty || ''}
                    onChange={(e) => setRndIngQty(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono"
                    placeholder="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Finding Notes (Standard feedback)</label>
                <textarea 
                  rows={2}
                  value={rndFindings}
                  onChange={(e) => setRndFindings(e.target.value)}
                  className="w-full rounded border p-2 text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-black text-white font-black text-xs py-2 uppercase rounded transition"
              >
                📥 File prototype trial specs
              </button>
            </form>
          </div>

          {/* Trial History list */}
          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-800 border-b pb-2">R&D TRIAL LOG BOOK HISTORY</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {rndLogs.length === 0 ? (
                <p className="text-center text-gray-400 italic py-12">No prototype trials logged.</p>
              ) : (
                rndLogs.map(item => (
                  <div key={item.id} className="border p-2.5 rounded bg-gray-55/35 space-y-1.5 text-[11px] font-semibold text-gray-700">
                    <div className="flex justify-between">
                      <span className="font-extrabold text-blue-955 uppercase text-xs">{item.menuName}</span>
                      <span className="text-[10px] font-mono text-gray-400">{item.date}</span>
                    </div>
                    <p className="text-gray-600 text-[10px] font-bold uppercase tracking-wider">Findings: <b className="text-gray-900 font-normal normal-case">{item.findings}</b></p>
                    <div className="flex justify-between text-[10px] leading-none pt-1.5 border-t">
                      <span className="text-gray-400">Total ingredients Trial cost:</span>
                      <span className="font-mono text-xs font-black text-blue-950">{formatMoney(item.totalCost)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 5: COMPLIMENTARY FOODS */}
      {activeTab === 'complimentary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-2 flex items-center gap-1">
              <Gift size={15} /> Log Complimentary Item Distributed
            </h3>

            <form onSubmit={handleSaveComplimentary} className="space-y-4">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Target Charged Department balance</label>
                <select
                  value={compDept}
                  onChange={(e) => setCompDept(e.target.value)}
                  className="w-full rounded border p-2 bg-white font-bold"
                >
                  <option value="FnB Restaurant">FnB Restaurant Group</option>
                  <option value="Kitchen">Kitchen Department</option>
                  <option value="Commissary">Main Commissary Unit</option>
                  <option value="Housekeeping">Housekeeping Operations</option>
                  <option value="Top Management">Top Management Office</option>
                  <option value="Sales and Marketing">Sales & Marketing Group</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Complimentary Recipe/Item description</label>
                <input 
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Bento Box VIP Sample"
                  className="w-full rounded border p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Distributed quantity</label>
                  <input 
                    type="number"
                    required
                    value={compQty || ''}
                    onChange={(e) => setCompQty(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Unit production Value basis (g)</label>
                  <input 
                    type="number"
                    required
                    value={compValue || ''}
                    onChange={(e) => setCompValue(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Official Notes</label>
                <textarea 
                  rows={2}
                  value={compNotes}
                  onChange={(e) => setCompNotes(e.target.value)}
                  className="w-full rounded border p-2 text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-black text-white font-black text-xs py-2 uppercase rounded transition"
              >
                📥 Save Complimentary outflow log
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-800 border-b pb-2">COMPLIMENTARY LOGGING BOOK HISTORIES</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {complimentaries.length === 0 ? (
                <p className="text-center text-gray-400 italic py-12">No complimentary instances recorded.</p>
              ) : (
                complimentaries.map(item => (
                  <div key={item.id} className="border p-2.5 rounded bg-gray-55/35 space-y-1.5 text-[11px] font-semibold text-gray-700">
                    <div className="flex justify-between uppercase">
                      <span className="font-extrabold text-blue-955">{item.itemName}</span>
                      <span className="text-[10px] font-mono text-gray-405">{item.date}</span>
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-wider">Charged segment: <b className="text-indigo-900 font-extrabold">{item.department}</b> | Notes: <b className="text-gray-800 font-medium normal-case">{item.notes}</b></p>
                    <div className="flex justify-between items-baseline pt-1.5 border-t">
                      <span className="text-gray-405 uppercase text-[9.5px]">Net production value charged:</span>
                      <span className="font-mono text-xs font-black text-gray-900">{formatMoney(item.value)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 6: STAFF CAFETERIA */}
      {activeTab === 'cafeteria' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-2 flex items-center gap-1">
              <Coffee size={15} /> Log Cafeteria Outflow
            </h3>

            <form onSubmit={handleSaveCafeteria} className="space-y-4">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Staff Meal Prepared</label>
                <input 
                  type="text"
                  required
                  value={cafMeal}
                  onChange={(e) => setCafMeal(e.target.value)}
                  placeholder="Pork Adobo & Rice"
                  className="w-full rounded border p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Pax Served Count</label>
                  <input 
                    type="number"
                    required
                    value={cafPax || ''}
                    onChange={(e) => setCafPax(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Consolidated cost (PHP)</label>
                  <input 
                    type="number"
                    required
                    value={cafCost || ''}
                    onChange={(e) => setCafCost(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-black text-white font-black text-xs py-2 uppercase rounded transition"
              >
                📥 Save staff cafeteria meal log
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-800 border-b pb-2">CAFETERIA PRODUCTION LEDGER HISTORIES</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto font-medium text-gray-650 text-[11px] uppercase">
              {cafeteria.length === 0 ? (
                <p className="text-center text-gray-400 italic py-12">No cafeteria logs currently.</p>
              ) : (
                cafeteria.map(item => (
                  <div key={item.id} className="border p-2.5 rounded bg-gray-55/35 flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-gray-900 text-xs">{item.mealName}</p>
                      <p className="text-[9px] text-gray-405 font-mono mt-1">Date: {item.date} | headcount: {item.paxServed} staff</p>
                    </div>
                    <span className="font-mono text-xs font-black text-blue-950">{formatMoney(item.totalCost)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
