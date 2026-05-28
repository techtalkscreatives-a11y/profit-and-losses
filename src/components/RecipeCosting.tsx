import React, { useState, useEffect } from 'react';
import { MenuCostingRecipe, InventoryItem } from '../types';
import { formatMoney } from '../utils';
import { 
  FileSpreadsheet, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Check, 
  Printer, 
  ChevronDown, 
  AlertCircle 
} from 'lucide-react';

interface RecipeCostingProps {
  recipes: MenuCostingRecipe[];
  inventory: InventoryItem[];
  onSave: (recipe: MenuCostingRecipe) => void;
  onScale: (scaledPayload: any) => void;
}

export const RecipeCostingComponent: React.FC<RecipeCostingProps> = ({
  recipes,
  inventory,
  onSave,
  onScale,
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState<MenuCostingRecipe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [scaleTarget, setScaleTarget] = useState<number>(100);
  const [formulaBar, setFormulaBar] = useState<string>('Select any cell to view formula');

  // Workbook Excel-Style Fields State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [typeOfEvent, setTypeOfEvent] = useState('');
  const [classification, setClassification] = useState('');
  const [recipeType, setRecipeType] = useState('');
  const [dateCreated, setDateCreated] = useState('');
  
  // Portion Control
  const [yieldPax, setYieldPax] = useState<number>(0);
  const [portionSize, setPortionSize] = useState('');
  const [batchActualCooked, setBatchActualCooked] = useState<number>(0);
  const [meatWeight, setMeatWeight] = useState<number>(0);
  const [vegWeight, setVegWeight] = useState<number>(0);
  const [sauceWeight, setSauceWeight] = useState<number>(0);
  const [shrinkagePct, setShrinkagePct] = useState<number>(0);

  // Prep & Temps
  const [prepTime, setPrepTime] = useState('');
  const [prepTemp, setPrepTemp] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [cookingTemp, setCookingTemp] = useState('');
  const [coolingTime, setCoolingTime] = useState('');
  const [coolingTemp, setCoolingTemp] = useState('');
  const [reheatingTime, setReheatingTime] = useState('');
  const [reheatingTemp, setReheatingTemp] = useState('');

  // Storage Checkboxes & Temps
  const [dryStrgActive, setDryStrgActive] = useState(false);
  const [dryStrgTemp, setDryStrgTemp] = useState('');
  const [chillerActive, setChillerActive] = useState(false);
  const [chillerTemp, setChillerTemp] = useState('');
  const [roomTpActive, setRoomTpActive] = useState(false);
  const [roomTpTemp, setRoomTpTemp] = useState('');
  const [freezerActive, setFreezerActive] = useState(false);
  const [freezerTemp, setFreezerTemp] = useState('');

  // Ingredients Grid
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  
  // Allergens
  const [allergens, setAllergens] = useState<string[]>([]);
  
  // Equipment (1 to 10 lines)
  const [equipments10, setEquipments10] = useState<string[]>(Array(10).fill(''));

  // Nutrition Facts State
  const [nutritionFacts, setNutritionFacts] = useState<any>({
    servingSize: '',
    servingsPerContainer: '',
    amountPerServing: '',
    calories: '',
    totalFat: '',
    saturatedFat: '',
    transfat: '',
    carbohydrates: '',
    dietaryFiber: '',
    sugars: '',
    addedSugars: '',
    protein: '',
    sodium: '',
    calcium: '',
    iron: '',
  });

  // Financial Config
  const [companyCostMargin, setCompanyCostMargin] = useState<number>(0);
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [estSellingPrice, setEstSellingPrice] = useState<number>(0);

  // Authenticated sign-offs
  const [signatoryChef, setSignatoryChef] = useState('');
  const [signatoryChefPos, setSignatoryChefPos] = useState('');
  const [signatoryApproved1, setSignatoryApproved1] = useState('');
  const [signatoryApproved1Pos, setSignatoryApproved1Pos] = useState('');
  const [signatoryApproved2, setSignatoryApproved2] = useState('');
  const [signatoryApproved2Pos, setSignatoryApproved2Pos] = useState('');

  // Procedure Text Area
  const [procedure, setProcedure] = useState('');

  const allergenList = [
    'Gluten', 'Soybeans', 'Sesame', 'Crustaceans', 'Milk & Dairy', 
    'Sulfites', 'Eggs', 'Tree Nuts', 'Lupins', 'Fish', 'Celery', 'Molluscs', 'Peanuts', 'Mustard'
  ];

  const handleStartNew = () => {
    setName('');
    setCode(`REC-${Date.now().toString().slice(-4)}`);
    setCategory('');
    setTypeOfEvent('');
    setClassification('');
    setRecipeType('');
    setDateCreated(new Date().toISOString().split('T')[0]);
    
    setYieldPax(0);
    setPortionSize('');
    setBatchActualCooked(0);
    setMeatWeight(0);
    setVegWeight(0);
    setSauceWeight(0);
    setShrinkagePct(0);

    setPrepTime('');
    setPrepTemp('');
    setCookingTime('');
    setCookingTemp('');
    setCoolingTime('');
    setCoolingTemp('');
    setReheatingTime('');
    setReheatingTemp('');

    setDryStrgActive(false);
    setDryStrgTemp('');
    setChillerActive(false);
    setChillerTemp('');
    setRoomTpActive(false);
    setRoomTpTemp('');
    setFreezerActive(false);
    setFreezerTemp('');

    setSelectedIngredients([]);
    setAllergens([]);
    setEquipments10(Array(10).fill(''));
    
    setNutritionFacts({
      servingSize: '',
      servingsPerContainer: '',
      amountPerServing: '',
      calories: '',
      totalFat: '',
      saturatedFat: '',
      transfat: '',
      carbohydrates: '',
      dietaryFiber: '',
      sugars: '',
      addedSugars: '',
      protein: '',
      sodium: '',
      calcium: '',
      iron: '',
    });

    setCompanyCostMargin(0);
    setFinalPrice(0);
    setEstSellingPrice(0);

    setSignatoryChef('');
    setSignatoryChefPos('');
    setSignatoryApproved1('');
    setSignatoryApproved1Pos('');
    setSignatoryApproved2('');
    setSignatoryApproved2Pos('');

    setProcedure('');
    setSelectedRecipe(null);
    setIsEditing(true);
    setFormulaBar('Sheet Initiated. Direct raw ingredients linkage active.');
  };

  const handleEdit = (rec: MenuCostingRecipe) => {
    setSelectedRecipe(rec);
    setName(rec.name);
    setCode(rec.recipeCode);
    setCategory(rec.category);
    setTypeOfEvent(rec.typeOfEvent || '');
    setClassification(rec.classification || '');
    setRecipeType(rec.recipeType || 'Standard Menu Item');
    setDateCreated(rec.dateCreated || new Date().toISOString().split('T')[0]);

    setYieldPax(rec.yieldPax || 1);
    setPortionSize(rec.portionSize || '300g');
    setBatchActualCooked(rec.batchActualCooked || 0);
    setMeatWeight(rec.meatWeight || 0);
    setVegWeight(rec.vegWeight || 0);
    setSauceWeight(rec.sauceWeight || 0);
    setShrinkagePct(rec.shrinkagePct || 0);

    setPrepTime(rec.prepTime || '');
    setPrepTemp(rec.prepTemp || '');
    setCookingTime(rec.cookingTime || '');
    setCookingTemp(rec.cookingTemp || '');
    setCoolingTime(rec.coolingTime || '');
    setCoolingTemp(rec.coolingTemp || '');
    setReheatingTime(rec.reheatingTime || '');
    setReheatingTemp(rec.reheatingTemp || '');

    setDryStrgActive(!!rec.dryStrgActive);
    setDryStrgTemp(rec.dryStrgTemp || '');
    setChillerActive(!!rec.chillerActive);
    setChillerTemp(rec.chillerTemp || '');
    setRoomTpActive(!!rec.roomTpActive);
    setRoomTpTemp(rec.roomTpTemp || '');
    setFreezerActive(!!rec.freezerActive);
    setFreezerTemp(rec.freezerTemp || '');

    setSelectedIngredients(rec.ingredients || []);
    setAllergens(rec.allergens || []);
    setEquipments10(rec.equipments10 || Array(10).fill(''));
    
    setNutritionFacts(rec.nutritionFacts || {
      servingSize: '',
      servingsPerContainer: '',
      amountPerServing: '',
      calories: '',
      totalFat: '',
      saturatedFat: '',
      transfat: '',
      carbohydrates: '',
      dietaryFiber: '',
      sugars: '',
      addedSugars: '',
      protein: '',
      sodium: '',
      calcium: '',
      iron: '',
    });

    setCompanyCostMargin(35);
    setFinalPrice(rec.finalPrice || 0);
    setEstSellingPrice(rec.estSellingPrice || 0);

    setSignatoryChef(rec.signatoryChef || '');
    setSignatoryChefPos(rec.signatoryChefPos || 'Executive Head Chef');
    setSignatoryApproved1(rec.signatoryApproved1 || '');
    setSignatoryApproved1Pos(rec.signatoryApproved1Pos || 'General Restaurant Manager');
    setSignatoryApproved2(rec.signatoryApproved2 || '');
    setSignatoryApproved2Pos(rec.signatoryApproved2Pos || 'F&B Comptroller');

    setProcedure(rec.procedure || '');
    setIsEditing(true);
    setFormulaBar(`Modified recipe file loaded. Unified COGS calculated live.`);
  };

  const addIngredientRow = () => {
    if (inventory.length === 0) return;
    const defaultIng = inventory[0];
    setSelectedIngredients([
      ...selectedIngredients,
      {
        ingredientId: defaultIng.id,
        desc: '',
        recoveryPct: 100,
        weightStandard: 100,
        weightCatering: 100,
        weightActual: 100,
        actualPurchase: 'g',
        unitPrice: defaultIng.unitCost,
      },
    ]);
  };

  const updateIngredientRow = (idx: number, key: string, val: any) => {
    const updated = [...selectedIngredients];
    if (key === 'ingredientId') {
      const matched = inventory.find((i) => i.id === val);
      updated[idx].ingredientId = val;
      if (matched) {
        updated[idx].unitPrice = matched.unitCost;
      }
    } else if (key === 'desc' || key === 'actualPurchase') {
      updated[idx][key] = val;
    } else {
      updated[idx][key] = Number(val);
    }
    setSelectedIngredients(updated);
  };

  const removeIngredientRow = (idx: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== idx));
  };

  const toggleAllergen = (all: string) => {
    if (allergens.includes(all)) {
      setAllergens(allergens.filter((a) => a !== all));
    } else {
      setAllergens([...allergens, all]);
    }
  };

  const handleEquipChange = (idx: number, val: string) => {
    const updated = [...equipments10];
    updated[idx] = val;
    setEquipments10(updated);
  };

  // REAL LIVE WORKBOOK RECIPE MATHEMATICS (Excel Formula equivalents)
  
  // Real Weight In Raw (G) = Sum of Weight Standard of all ingredients
  const computedWeightInRaw = selectedIngredients.reduce((acc, current) => {
    return acc + (Number(current.weightStandard) || 0);
  }, 0);

  // Weight Per Portion (G) = Raw Weight * (1 - portion shrinkage percent / 100) / Yield Pax
  // If yieldPax === 0, show #DIV/0!
  const computedWeightPerPortion = yieldPax > 0 
    ? Number(((computedWeightInRaw * (1 - (shrinkagePct / 100))) / yieldPax).toFixed(2)) 
    : 0;

  // Shrinkage in Grams
  const computedShrinkageGrams = Number((computedWeightInRaw * (shrinkagePct / 100)).toFixed(2));

  // Live ingredient cost lines
  const computedIngredients = selectedIngredients.map((item) => {
    // Formula: Weight Std * (UnitPrice / 1000) * (100 / Recovery%)
    const recoveryFactor = Number(item.recoveryPct) > 0 ? (100 / Number(item.recoveryPct)) : 1;
    const computedCost = (Number(item.weightStandard) / 1000) * Number(item.unitPrice) * recoveryFactor;
    return {
      ...item,
      computedCost: Number(computedCost.toFixed(2))
    };
  });

  // Foodcost totals
  const subtotalRawFoodCost = computedIngredients.reduce((acc, current) => acc + current.computedCost, 0);
  const foodContingency10 = Number((subtotalRawFoodCost * 0.10).toFixed(2));
  const totalFoodCost = Number((subtotalRawFoodCost + foodContingency10).toFixed(2));
  
  // Foodcost Per Head
  const foodCostPerHead = yieldPax > 0 ? Number((totalFoodCost / yieldPax).toFixed(2)) : 0;

  // Overhead Formula: 30% Labor, 30% Opex, 12% Government tax calculated relative to the totalFoodCost base count
  const laborCost30 = Number((totalFoodCost * 0.30).toFixed(2));
  const opex30 = Number((totalFoodCost * 0.30).toFixed(2));
  const vatTax12 = Number((totalFoodCost * 0.12).toFixed(2));
  const consolidatedCOGS = Number((totalFoodCost + laborCost30 + opex30 + vatTax12).toFixed(2));

  // Financial Recommendations
  // Recommended Selling Price based on Margin Percent
  const recommendedSellingPrice = companyCostMargin > 0 
    ? Number((foodCostPerHead / (companyCostMargin / 100)).toFixed(2)) 
    : 0;

  // Food cost Percentage
  // Formula: (Foodcost per Head / Selling Price) * 100%
  const computedFoodCostPercentage = finalPrice > 0 
    ? Number(((foodCostPerHead / finalPrice) * 100).toFixed(2)) 
    : 0;

  // Live margin profit
  const computedProfit = finalPrice > 0 
    ? Number((finalPrice - foodCostPerHead).toFixed(2)) 
    : 0;

  const handleSave = () => {
    if (!name.trim()) return alert('Error: Please input a descriptive Product Recipe name.');
    
    // Package ingredients for structural compatibility with types
    const ingredientsPayload = computedIngredients.map(ing => ({
      ingredientId: ing.ingredientId,
      weightStandard: ing.weightStandard,
      weightActual: ing.weightActual,
      unitPrice: ing.unitPrice,
      recoveryPct: ing.recoveryPct,
      desc: ing.desc,
      weightCatering: ing.weightCatering,
      actualPurchase: ing.actualPurchase,
    }));

    // Filter tools list to non-empty
    const activeTools = equipments10.filter(t => t.trim() !== '');

    const newRecipe: MenuCostingRecipe = {
      id: selectedRecipe ? selectedRecipe.id : `recipe-${Date.now()}`,
      name,
      recipeCode: code,
      category,
      yieldPax,
      portionSize,
      meatWeight,
      vegWeight,
      sauceWeight,
      shrinkagePct,
      prepTime,
      cookingTime,
      procedure,
      laborCost30,
      opex30,
      vat12: vatTax12,
      cogs: consolidatedCOGS,
      foodCost: totalFoodCost,
      foodCostPercentage: finalPrice > 0 ? computedFoodCostPercentage : 0,
      profit: computedProfit,
      recommendedPrice: recommendedSellingPrice,
      finalPrice: finalPrice || recommendedSellingPrice,
      ingredients: ingredientsPayload,
      allergens,
      equipments: activeTools,
      
      // Extended spreadsheet variables stored inside the DB state dynamically
      typeOfEvent,
      classification,
      recipeType,
      dateCreated,
      estSellingPrice,
      batchActualCooked,
      weightInRaw: computedWeightInRaw,
      weightPerPortion: computedWeightPerPortion,
      shrinkageGrams: computedShrinkageGrams,
      prepTemp,
      cookingTemp,
      coolingTime,
      coolingTemp,
      reheatingTime,
      reheatingTemp,
      dryStrgActive,
      dryStrgTemp,
      chillerActive,
      chillerTemp,
      roomTpActive,
      roomTpTemp,
      freezerActive,
      freezerTemp,
      nutritionFacts,
      equipments10,
      signatoryChef,
      signatoryChefPos,
      signatoryApproved1,
      signatoryApproved1Pos,
      signatoryApproved2,
      signatoryApproved2Pos,
    };

    onSave(newRecipe);
    setIsEditing(false);
  };

  const handleScaleSubmit = (recipe: MenuCostingRecipe) => {
    const factor = scaleTarget / (recipe.yieldPax || 1);
    const scaledIngs = (recipe.ingredients || []).map((ing) => {
      const invMatch = inventory.find((i) => i.id === ing.ingredientId);
      const totalAmountNeededGrams = ing.weightStandard * factor;
      const totalCost = (totalAmountNeededGrams / 1000) * ing.unitPrice * (100 / (ing.recoveryPct || 100));
      return {
        name: invMatch ? invMatch.name : 'Unknown Ingredient',
        unit: invMatch ? invMatch.unit : 'g',
        ingredientId: ing.ingredientId,
        baseQtyGrams: ing.weightStandard,
        scaledQtyNeeded: Number(totalAmountNeededGrams.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
      };
    });

    onScale({
      recipeName: recipe.name,
      basePax: recipe.yieldPax,
      targetPax: scaleTarget,
      factor,
      scaledIngredients: scaledIngs,
      totalScaledCost: Number(scaledIngs.reduce((sum, current) => sum + current.totalCost, 0).toFixed(2)),
    });
  };

  return (
    <div className="space-y-3 font-sans antialiased text-gray-800">
      
      {/* Visual Header */}
      <div className="bg-white border border-gray-300 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm gap-2">
        <div>
          <h2 className="text-base font-black uppercase tracking-tight text-gray-900 flex items-center gap-1.5">
            <span className="text-emerald-700"><FileSpreadsheet size={18} /></span>
            Excel Interactive Recipe Costing Workbook
          </h2>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            Automated shrinkage percentage calculations with standard BIR Tax and OPEX formula grids
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleStartNew}
            className="self-start md:self-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 px-3 rounded shadow transition-all duration-150 flex items-center gap-1 mr-1"
          >
            <Plus size={14} /> Create Master Recipe Form
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Active Recipes Index Column */}
          <div className="lg:col-span-7 bg-white rounded border border-gray-300 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 text-xs font-bold uppercase text-gray-700 flex items-center justify-between">
              <span>Standard Recipe Index ({recipes.length})</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Master Book</span>
            </div>
            
            <div className="divide-y divide-gray-200 overflow-y-auto max-h-[550px]">
              {recipes.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-xs text-gray-400 italic font-mono">No recipes recorded in standard manifest database.</p>
                  <button 
                    onClick={handleStartNew} 
                    className="mt-3 text-xs text-emerald-700 font-bold hover:underline"
                  >
                    Click here to begin your first recipe workbook
                  </button>
                </div>
              ) : (
                recipes.map((rec) => (
                  <div key={rec.id} className="p-3 hover:bg-gray-50 flex items-center justify-between transition duration-150">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">{rec.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-500 font-mono">
                        <span className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-bold">{rec.recipeCode}</span>
                        <span>|</span>
                        <span>Yield: <strong className="text-gray-700 font-bold">{rec.yieldPax} pax</strong></span>
                        <span>|</span>
                        <span>Portion: <strong className="text-gray-700 font-bold">{rec.portionSize}</strong></span>
                        <span>|</span>
                        <span>Cost per pax: <strong className="text-emerald-700 font-bold">{formatMoney(rec.foodCost / (rec.yieldPax || 1))}</strong></span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleScaleSubmit(rec)}
                        className="rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
                      >
                        Scale Qty
                      </button>
                      <button
                        onClick={() => handleEdit(rec)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition"
                      >
                        Open Workbook
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scale Multiplier & Stock request column */}
          <div className="lg:col-span-5 bg-white rounded border border-gray-300 p-4 shadow-sm h-fit space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Event Volume Multiplier
              </span>
              <h3 className="mt-2 text-sm font-bold text-gray-900 uppercase">
                Stock Request & Procurement Needs
              </h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed font-medium">
                Multiply standard ingredients dynamically to generate shopping manifests for mass banquets, catering contracts, bento boxes, and events.
              </p>
              
              <div className="mt-4 form-group">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wide block mb-1">
                  Target Pax / Portions Needed
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={scaleTarget}
                    onChange={(e) => setScaleTarget(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded border border-gray-300 p-2 font-mono text-xs font-bold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    placeholder="e.g. 150 pax"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-extrabold text-gray-400 uppercase">PAX COUNT</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 p-3 rounded border border-amber-200 text-[10px] text-amber-800 font-medium leading-relaxed space-y-1">
              <p className="font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={12} className="text-amber-700" /> Procurement Alert Tip
              </p>
              <p>
                Calculations read standard Raw weights from standard formulas and automatically add the computed % Yield recovery factor so that kitchen staffs receive correct raw purchasing specifications.
              </p>
            </div>
          </div>
        </div>
      ) : (
        
        /* FULL-BLOWN INTERACTIVE SPREADSHEET (Layout modeled perfectly on screenshots) */
        <div className="bg-[#f3f4f6] border border-gray-300 rounded overflow-hidden shadow">
          
          {/* Top Control Header Panel */}
          <div className="bg-emerald-800 text-white px-3 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-emerald-950 font-semibold gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-950 px-2 py-1 rounded text-[10px] font-black uppercase text-emerald-400">ACTIVE ROW</span>
              <span className="font-mono text-emerald-100">{name || 'Unnamed Costing Sheet'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded transition"
              >
                Exit Workbook
              </button>
              <button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded shadow flex items-center gap-1 transition"
              >
                <Save size={12} /> Save Document
              </button>
            </div>
          </div>

          {/* Excel Formula Bar Row */}
          <div className="bg-white border-b border-gray-300 px-3 py-1 text-xs flex items-center gap-2">
            <span className="font-mono font-black border-r border-gray-300 pr-2 text-gray-500 uppercase tracking-widest text-[10px] flex items-center gap-0.5">
              fx
            </span>
            <input
              type="text"
              readOnly
              value={formulaBar}
              className="w-full bg-gray-50 border border-gray-200 p-1 text-[11px] font-mono text-gray-700 focus:outline-none rounded"
            />
          </div>

          <div className="p-3 space-y-3 max-w-full overflow-x-auto">
            <div className="min-w-[950px] space-y-3">
              
              {/* SPREADSHEET HEADER PORTION (Screenshot Header Format) */}
              <div className="grid grid-cols-12 gap-2 bg-white p-3 rounded border border-gray-300 shadow-sm relative">
                
                {/* Column banner logo cell block */}
                <div 
                  className="col-span-3 border-4 border-double border-gray-700 p-2 flex flex-col justify-center items-center bg-[#fdfdfd]"
                  onClick={() => setFormulaBar('=STRING("OCEAN BITES RESTAURANT")')}
                >
                  <p className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase">Enterprise Grid</p>
                  <h1 className="text-base font-black tracking-tight text-gray-900 text-center font-mono">
                    OCEAN BITES
                  </h1>
                  <p className="text-[9px] font-black text-gray-800 tracking-widest text-center uppercase border-t border-gray-300 pt-0.5 mt-0.5">
                    RESTAURANT
                  </p>
                </div>

                {/* KPI selling cost parameters block column */}
                <div className="col-span-3 grid grid-cols-1 gap-1 text-[10px] font-mono border-r border-gray-200 pr-2">
                  <div 
                    className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200 rounded hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setFormulaBar('=SUM(H_SUBTOTAL + H_CONTINGENCY)')}
                  >
                    <span className="text-gray-500 font-sans font-bold uppercase text-[9px]">BANQUET FOOD COST:</span>
                    <strong className="text-gray-900 font-black">{formatMoney(totalFoodCost)}</strong>
                  </div>
                  <div 
                    className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200 rounded hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setFormulaBar('=(FOODCOST_PER_HEAD / (COMPANY_COST_MARGIN / 100))')}
                  >
                    <span className="text-gray-500 font-sans font-bold uppercase text-[9px]">REC. SELLING PRICE:</span>
                    <strong className="text-[#15803d] font-black">{formatMoney(recommendedSellingPrice)}</strong>
                  </div>
                  <div 
                    className="flex justify-between items-center bg-blue-50 p-1 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer"
                    onClick={() => setFormulaBar('=INPUT_CELL_SELLING_PRICE')}
                  >
                    <span className="text-blue-900 font-sans font-bold uppercase text-[9px]">SELLING PRICE:</span>
                    <input 
                      type="number"
                      value={finalPrice || ''}
                      onChange={(e) => setFinalPrice(Number(e.target.value))}
                      className="w-20 bg-white border border-blue-400 p-0.5 text-right font-black font-mono text-blue-900 focus:outline-none"
                    />
                  </div>
                  <div 
                    className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200 rounded hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setFormulaBar('=INPUT_CELL_EST_SELLING_PRICE')}
                  >
                    <span className="text-gray-500 font-sans font-bold uppercase text-[9px]">EST. SELLING PRICE:</span>
                    <input 
                      type="number"
                      value={estSellingPrice || ''}
                      onChange={(e) => setEstSellingPrice(Number(e.target.value))}
                      className="w-20 bg-white border border-gray-200 p-0.5 text-right font-bold focus:outline-none"
                    />
                  </div>
                  <div 
                    className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200 rounded hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setFormulaBar('=IF(SELLING_PRICE > 0, FOODCOST_PER_HEAD / SELLING_PRICE, "#DIV/0!")')}
                  >
                    <span className="text-gray-500 font-sans font-bold uppercase text-[9px]">FOODCOST PERCENTAGE:</span>
                    <strong className={`font-black ${finalPrice > 0 ? (computedFoodCostPercentage <= companyCostMargin ? 'text-emerald-700' : 'text-amber-700') : 'text-red-600'}`}>
                      {finalPrice > 0 ? `${computedFoodCostPercentage}%` : '#DIV/0!'}
                    </strong>
                  </div>
                  <div 
                    className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200 rounded hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setFormulaBar('=IF(SELLING_PRICE > 0, SELLING_PRICE - FOODCOST_PER_HEAD, "#DIV/0!")')}
                  >
                    <span className="text-gray-500 font-sans font-bold uppercase text-[9px]">MARGIN PROFIT:</span>
                    <strong className={`font-black ${finalPrice > 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                      {finalPrice > 0 ? formatMoney(computedProfit) : '#DIV/0!'}
                    </strong>
                  </div>
                </div>

                {/* Event Category Metadata Column */}
                <div className="col-span-3 grid grid-cols-1 gap-1 text-[10px] text-gray-700 border-r border-gray-200 pr-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400">TYPE OF EVENT</span>
                    <input 
                      type="text" 
                      value={typeOfEvent}
                      onChange={(e) => setTypeOfEvent(e.target.value)}
                      placeholder="e.g. Wedding Banquet"
                      className="border border-gray-300 p-1 text-[11px] font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400">CLASSIFICATION COLLECTION</span>
                    <input 
                      type="text" 
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      placeholder="e.g. Core Seafood"
                      className="border border-gray-300 p-1 text-[11px] font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400">MENU CATEGORY</span>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="border border-gray-300 p-1 text-[11px] font-bold focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="Ala Carte">Ala Carte / POS Menu</option>
                      <option value="Food Trays">Food Trays Pack</option>
                      <option value="Bento Boxes">Bento Boxes Package</option>
                      <option value="Banquets">Banquets Catering</option>
                      <option value="Catering Services">Catering Services</option>
                      <option value="In Room Dining">In Room Dining</option>
                      <option value="Room Service">Room Service</option>
                    </select>
                  </div>
                </div>

                {/* Code, Date and Name metadata block */}
                <div className="col-span-3 grid grid-cols-1 gap-1 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400">RECIPE CODE</span>
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="border border-gray-300 p-1 text-[11px] font-mono font-bold uppercase bg-gray-50 select-text"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400">DATE RECORDED</span>
                    <input 
                      type="date" 
                      value={dateCreated}
                      onChange={(e) => setDateCreated(e.target.value)}
                      className="border border-gray-300 p-1 text-[11px] font-bold"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-emerald-600 font-extrabold">PRODUCT RECIPE NAME</span>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Angus Beef Tips Bolognese"
                      className="border border-emerald-300 bg-emerald-50/50 p-1 text-[11px] font-extrabold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* ROW SECTION 2: PORTION CONTROL & BATCH WEIGHT VALUES */}
              <div 
                className="grid grid-cols-12 gap-2 bg-white p-3 rounded border border-gray-300 shadow-sm"
                onClick={() => setFormulaBar('Portion size metadata sheet values')}
              >
                
                {/* Yield cell */}
                <div 
                  className="col-span-2 border border-gray-300 rounded p-2 text-center bg-gray-50 flex flex-col justify-between cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormulaBar('=INPUT_TOTAL_YIELD_PAX (Yield portion scale base)');
                  }}
                >
                  <label className="text-[9px] font-black uppercase text-gray-400">TOTAL YIELD / SERVING</label>
                  <div className="my-1.5">
                    <input 
                      type="number" 
                      value={yieldPax}
                      onChange={(e) => setYieldPax(Math.max(1, Number(e.target.value)))}
                      className="w-16 border border-gray-300 text-center font-mono font-black text-sm p-1"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase">PAX/SERVINGS</span>
                </div>

                {/* Size portion */}
                <div 
                  className="col-span-2 border border-gray-300 rounded p-2 text-center bg-gray-50 flex flex-col justify-between cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormulaBar('=INPUT_SIZE_PER_PORTION (Portion weight string label)');
                  }}
                >
                  <label className="text-[9px] font-black uppercase text-gray-400">SIZE PER PORTION</label>
                  <div className="my-1.5">
                    <input 
                      type="text" 
                      value={portionSize}
                      onChange={(e) => setPortionSize(e.target.value)}
                      className="w-20 border border-gray-300 text-center font-black text-sm p-1"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase">G OR OZ UNIT</span>
                </div>

                {/* Weight grid formulas */}
                <div className="col-span-5 border border-gray-200 rounded p-2 grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-white">
                  <div 
                    className="flex flex-col justify-between bg-gray-50 p-1 border border-gray-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormulaBar('=INPUT_BATCH_ACTUAL_COOKED_WEIGHT (G)');
                    }}
                  >
                    <span className="text-gray-400 text-[8px] font-bold uppercase">BATCH COOKED (G)</span>
                    <input 
                      type="number"
                      value={batchActualCooked || ''}
                      onChange={(e) => setBatchActualCooked(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 text-center font-black p-0.5 text-xs m-0.5"
                    />
                  </div>
                  
                  <div 
                    className="flex flex-col justify-between bg-emerald-50 p-1 border border-emerald-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormulaBar('=SUM(WEIGHT_STANDARD_INGREDIENTS) (g)');
                    }}
                  >
                    <span className="text-emerald-800 text-[8px] font-bold uppercase">WEIGHT IN RAW (G)</span>
                    <strong className="text-center font-black block text-sm text-emerald-950 mt-1">
                      {computedWeightInRaw} G
                    </strong>
                  </div>

                  <div 
                    className="flex flex-col justify-between bg-amber-50 p-1 border border-amber-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormulaBar('=IF(YIELD_PAX > 0, (WEIGHT_IN_RAW * (1 - SHRINKAGE_PCT/100)) / YIELD_PAX, "#DIV/0!")');
                    }}
                  >
                    <span className="text-amber-800 text-[8px] font-bold uppercase">WT PER PORTION (G)</span>
                    <strong className="text-center font-black block text-sm text-amber-950 mt-1">
                      {yieldPax > 0 ? `${computedWeightPerPortion} G` : '#DIV/0!'}
                    </strong>
                  </div>

                  <div 
                    className="flex flex-col justify-between bg-gray-50 p-1 border border-gray-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormulaBar('=INPUT_MEAT_COMPONENT_WEIGHT (g)');
                    }}
                  >
                    <span className="text-gray-550 text-[8px] font-bold uppercase">MEAT SPEC (G)</span>
                    <input 
                      type="number"
                      value={meatWeight || ''}
                      onChange={(e) => setMeatWeight(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 text-center font-bold p-0.5"
                    />
                  </div>

                  <div 
                    className="flex flex-col justify-between bg-gray-50 p-1 border border-gray-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormulaBar('=INPUT_VEG_COMPONENT_WEIGHT (g)');
                    }}
                  >
                    <span className="text-gray-550 text-[8px] font-bold uppercase">VEG SPEC (G)</span>
                    <input 
                      type="number"
                      value={vegWeight || ''}
                      onChange={(e) => setVegWeight(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 text-center font-bold p-0.5"
                    />
                  </div>

                  <div 
                    className="flex flex-col justify-between bg-gray-50 p-1 border border-gray-100 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormulaBar('=INPUT_SAUCE_COMPONENT_WEIGHT (g)');
                    }}
                  >
                    <span className="text-gray-550 text-[8px] font-bold uppercase">SAUCE SPEC (G)</span>
                    <input 
                      type="number"
                      value={sauceWeight || ''}
                      onChange={(e) => setSauceWeight(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 text-center font-bold p-0.5"
                    />
                  </div>
                </div>

                {/* Real Shrinkage input block */}
                <div 
                  className="col-span-3 border border-red-200 bg-red-50/40 rounded p-2 text-center flex flex-col justify-between cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormulaBar('=INPUT_SHRINKAGE_PERCENTAGE');
                  }}
                >
                  <label className="text-[9px] font-black uppercase text-red-700">SHRINKAGE ALLOCATION (% / G)</label>
                  <div className="flex justify-center items-center gap-1.5 my-1">
                    <div className="flex items-center gap-0.5">
                      <input 
                        type="number" 
                        value={shrinkagePct}
                        onChange={(e) => setShrinkagePct(Number(e.target.value))}
                        className="w-11 border border-red-300 text-center font-mono font-black text-xs p-0.5 text-red-700 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-red-700">%</span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <span className="font-mono font-black text-red-900 text-xs">{computedShrinkageGrams} G</span>
                  </div>
                  <span className="text-[9px] font-bold text-red-600 uppercase">SHRINK LOSS IN WEIGHT</span>
                </div>

              </div>

              {/* ROW SECTION 3: COOKING AND STORAGE METADATA PARAMETERS */}
              <div className="grid grid-cols-12 gap-2">
                
                {/* Temps Column */}
                <div 
                  className="col-span-6 bg-white p-2.5 rounded border border-gray-300 grid grid-cols-2 gap-2 shadow-sm"
                  onClick={() => setFormulaBar('Kitchen standard control times and temperatures values')}
                >
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase text-gray-400">PREP TIME | TEMP</label>
                    <div className="flex gap-1 mt-0.5">
                      <input 
                        type="text" 
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        placeholder="15 mins"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                      <input 
                        type="text" 
                        value={prepTemp}
                        onChange={(e) => setPrepTemp(e.target.value)}
                        placeholder="22°C"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase text-gray-400">COOKING TIME | TEMP</label>
                    <div className="flex gap-1 mt-0.5">
                      <input 
                        type="text" 
                        value={cookingTime}
                        onChange={(e) => setCookingTime(e.target.value)}
                        placeholder="15 mins"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                      <input 
                        type="text" 
                        value={cookingTemp}
                        onChange={(e) => setCookingTemp(e.target.value)}
                        placeholder="180°C"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase text-gray-400">COOLING TIME | TEMP</label>
                    <div className="flex gap-1 mt-0.5">
                      <input 
                        type="text" 
                        value={coolingTime}
                        onChange={(e) => setCoolingTime(e.target.value)}
                        placeholder="30 mins"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                      <input 
                        type="text" 
                        value={coolingTemp}
                        onChange={(e) => setCoolingTemp(e.target.value)}
                        placeholder="4°C"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase text-gray-400">RE-HEATING TIME | TEMP</label>
                    <div className="flex gap-1 mt-0.5">
                      <input 
                        type="text" 
                        value={reheatingTime}
                        onChange={(e) => setReheatingTime(e.target.value)}
                        placeholder="5 mins"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                      <input 
                        type="text" 
                        value={reheatingTemp}
                        onChange={(e) => setReheatingTemp(e.target.value)}
                        placeholder="75°C"
                        className="w-1/2 border border-gray-300 p-0.5 text-[10px] font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Storage Toggle checkboxes column */}
                <div 
                  className="col-span-6 bg-white p-2.5 rounded border border-gray-300 grid grid-cols-2 gap-2 shadow-sm font-mono text-[10px]"
                  onClick={() => setFormulaBar('HACCP Critical Control Point storage specifications')}
                >
                  <div className="flex justify-between items-center bg-gray-50 p-1 border rounded">
                    <div className="flex items-center gap-1.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={dryStrgActive} 
                        onChange={(e) => setDryStrgActive(e.target.checked)}
                        className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 rounded"
                        id="dry_chk"
                      />
                      <label htmlFor="dry_chk" className="font-sans font-bold text-gray-500 uppercase text-[9px] cursor-pointer">DRY STRG</label>
                    </div>
                    <input 
                      type="text" 
                      value={dryStrgTemp}
                      onChange={(e) => setDryStrgTemp(e.target.value)}
                      placeholder="Temp"
                      className="w-14 bg-white border border-gray-200 text-center p-0.5 text-[10px]"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-1 border rounded">
                    <div className="flex items-center gap-1.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={chillerActive} 
                        onChange={(e) => setChillerActive(e.target.checked)}
                        className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 rounded"
                        id="chill_chk"
                      />
                      <label htmlFor="chill_chk" className="font-sans font-bold text-gray-500 uppercase text-[9px] cursor-pointer">CHILLER</label>
                    </div>
                    <input 
                      type="text" 
                      value={chillerTemp}
                      onChange={(e) => setChillerTemp(e.target.value)}
                      placeholder="Temp"
                      className="w-14 bg-white border border-gray-200 text-center p-0.5 text-[10px]"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-1 border rounded">
                    <div className="flex items-center gap-1.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={roomTpActive} 
                        onChange={(e) => setRoomTpActive(e.target.checked)}
                        className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 rounded"
                        id="room_chk"
                      />
                      <label htmlFor="room_chk" className="font-sans font-bold text-gray-500 uppercase text-[9px] cursor-pointer">ROOM TP</label>
                    </div>
                    <input 
                      type="text" 
                      value={roomTpTemp}
                      onChange={(e) => setRoomTpTemp(e.target.value)}
                      placeholder="Temp"
                      className="w-14 bg-white border border-gray-200 text-center p-0.5 text-[10px]"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 p-1 border rounded">
                    <div className="flex items-center gap-1.5 select-none">
                      <input 
                        type="checkbox" 
                        checked={freezerActive} 
                        onChange={(e) => setFreezerActive(e.target.checked)}
                        className="h-3 w-3 text-emerald-600 focus:ring-emerald-500 rounded"
                        id="freezer_chk"
                      />
                      <label htmlFor="freezer_chk" className="font-sans font-bold text-gray-500 uppercase text-[9px] cursor-pointer">FREEZER</label>
                    </div>
                    <input 
                      type="text" 
                      value={freezerTemp}
                      onChange={(e) => setFreezerTemp(e.target.value)}
                      placeholder="Temp"
                      className="w-14 bg-white border border-gray-200 text-center p-0.5 text-[10px]"
                    />
                  </div>
                </div>

              </div>


              {/* INTERACTIVE ROW GRID LAYOUT FOR INGREDIENTS TABLE WORKSHEET */}
              <div className="grid grid-cols-12 gap-3">
                
                {/* Ingredients Worksheet matrix (Left side) */}
                <div className="col-span-9 bg-white rounded border border-gray-300 shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Worksheet Column headers matching custom spreadsheet table */}
                  <div className="bg-emerald-900 text-white font-mono text-[10px] font-black uppercase text-center grid grid-cols-12 border-b border-emerald-950">
                    <div className="py-1 border-r border-emerald-800 col-span-3">INGREDIENTS</div>
                    <div className="py-1 border-r border-emerald-800 col-span-2">DESC.</div>
                    <div className="py-1 border-r border-emerald-800 col-span-1">% RECOVERY</div>
                    <div className="py-1 border-r border-emerald-800 col-span-3 text-center">
                      WEIGHT (G) 
                      <div className="grid grid-cols-3 border-t border-emerald-800 mt-1">
                        <span className="text-[8px] py-0.5 border-r border-emerald-800">STD</span>
                        <span className="text-[8px] py-0.5 border-r border-emerald-800">CATER</span>
                        <span className="text-[8px] py-0.5">ACTUAL</span>
                      </div>
                    </div>
                    <div className="py-1 border-r border-emerald-800 col-span-1.5">ACTUAL PUR.</div>
                    <div className="py-1 border-r border-emerald-800 col-span-1 border-r">UNIT COST</div>
                    <div className="py-1 col-span-1 text-center">TOTAL COST</div>
                  </div>

                  {/* Active row rows */}
                  <div className="divide-y divide-gray-200">
                    {computedIngredients.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50">
                        <p className="text-xs text-gray-400 italic">Ingredients ledger matrix empty. Clear matching direct purchases to populate.</p>
                        <button 
                          type="button" 
                          onClick={addIngredientRow}
                          className="mt-2 text-xs font-bold text-emerald-800 hover:underline flex items-center gap-0.5 mx-auto"
                        >
                          <Plus size={12} /> Add First Worksheet Row
                        </button>
                      </div>
                    ) : (
                      computedIngredients.map((item, idx) => {
                        const matchedInv = inventory.find((i) => i.id === item.ingredientId);
                        
                        return (
                          <div 
                            key={idx} 
                            className="grid grid-cols-12 text-xs font-mono items-center hover:bg-emerald-50/40 relative group"
                            onClick={() => setFormulaBar(`Ingredient Line ${idx+1}: =${item.weightStandard} * (${item.unitPrice}/1000) * (100 / ${item.recoveryPct || 100}) Recovery Factor`)}
                          >
                            
                            {/* Selector Field */}
                            <div className="col-span-3 p-1 border-r border-gray-200">
                              <select
                                value={item.ingredientId}
                                onChange={(e) => updateIngredientRow(idx, 'ingredientId', e.target.value)}
                                className="w-full bg-white border border-gray-200 p-0.5 text-[11px] font-sans font-bold focus:outline-none focus:border-emerald-600 rounded"
                              >
                                {inventory.map((inv) => (
                                  <option key={inv.id} value={inv.id}>
                                    {inv.name} (₱{inv.unitCost}/{inv.unit})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Description Field */}
                            <div className="col-span-2 p-1 border-r border-gray-200">
                              <input 
                                type="text"
                                value={item.desc || ''}
                                onChange={(e) => updateIngredientRow(idx, 'desc', e.target.value)}
                                placeholder="e.g. Fresh, chopped"
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 p-0.5 focus:bg-white focus:outline-none text-[11px]"
                              />
                            </div>

                            {/* % Recovery yield factor */}
                            <div className="col-span-1 p-1 border-r border-gray-200 text-center">
                              <input 
                                type="number"
                                value={item.recoveryPct || ''}
                                onChange={(e) => updateIngredientRow(idx, 'recoveryPct', e.target.value)}
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 text-center focus:bg-white focus:outline-none font-black text-[11px]"
                              />
                            </div>

                            {/* Weights standard, catering, actual usage */}
                            <div className="col-span-3 grid grid-cols-3 border-r border-gray-200 h-full items-center">
                              <div className="p-1 border-r border-gray-100 h-full flex items-center">
                                <input 
                                  type="number"
                                  value={item.weightStandard || ''}
                                  onChange={(e) => updateIngredientRow(idx, 'weightStandard', e.target.value)}
                                  className="w-full bg-transparent border border-transparent hover:border-gray-300 text-center focus:bg-white focus:outline-none font-extrabold text-[11px]"
                                />
                              </div>
                              <div className="p-1 border-r border-gray-100 h-full flex items-center">
                                <input 
                                  type="number"
                                  value={item.weightCatering || ''}
                                  onChange={(e) => updateIngredientRow(idx, 'weightCatering', e.target.value)}
                                  className="w-full bg-transparent border border-transparent hover:border-gray-300 text-center focus:bg-white focus:outline-none text-gray-500 text-[11px]"
                                />
                              </div>
                              <div className="p-1 h-full flex items-center">
                                <input 
                                  type="number"
                                  value={item.weightActual || ''}
                                  onChange={(e) => updateIngredientRow(idx, 'weightActual', e.target.value)}
                                  className="w-full bg-transparent border border-transparent hover:border-gray-300 text-center focus:bg-white focus:outline-none text-[11px]"
                                />
                              </div>
                            </div>

                            {/* Actual Purchase unit label description */}
                            <div className="col-span-1.5 p-1 border-r border-gray-200">
                              <input 
                                type="text"
                                value={item.actualPurchase || ''}
                                onChange={(e) => updateIngredientRow(idx, 'actualPurchase', e.target.value)}
                                placeholder="g"
                                className="w-full bg-transparent border border-transparent hover:border-gray-300 p-0.5 focus:bg-white text-center focus:outline-none text-[11px]"
                              />
                            </div>

                            {/* Unit price from inventory cost / item cost override */}
                            <div className="col-span-1 p-1 border-r border-gray-200 text-right pr-2">
                              <span>{formatMoney(item.unitPrice)}</span>
                            </div>

                            {/* Computed row cost result cell */}
                            <div className="col-span-1 p-1 text-right pr-2 font-black text-gray-900 bg-gray-50/60 flex items-center justify-between">
                              <span className="w-full text-right">{formatMoney(item.computedCost)}</span>
                              
                              {/* Row delete float button */}
                              <button 
                                type="button" 
                                onClick={() => removeIngredientRow(idx)}
                                className="text-red-500 hover:text-red-800 font-extrabold ml-1 leading-none p-0.5 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition duration-150"
                                title="Delete ingredient line"
                              >
                                ×
                              </button>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Row Button ledger anchor */}
                  <div className="bg-gray-100 p-1.5 border-t border-gray-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={addIngredientRow}
                      className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-800 hover:text-emerald-950 transition"
                    >
                      <Plus size={14} /> Add Ingredient Row
                    </button>
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest font-sans">
                      Ingredients Linked Directly live from warehouse database
                    </span>
                  </div>

                  {/* DOUBLE EXPENSES SUM COLUMN Gird Layout (MODELLED ON ACCORDING TO SCREENSHOT ROWS) */}
                  <div className="border-t-2 border-gray-300 bg-gray-50/70 grid grid-cols-2 text-[10px] font-mono leading-relaxed">
                    
                    {/* BOTTOM LEFT SUMMARY SECTION: OVERHEAD ADMINISTRATIVE COSTS */}
                    <div 
                      className="p-3 border-r border-gray-300 space-y-1.5"
                      onClick={() => setFormulaBar('Administrative Overhead and Cost Margin Allocation')}
                    >
                      <p className="font-sans font-black text-gray-500 uppercase tracking-wider text-[9px] border-b pb-1 mb-1">
                        OVERHEAD & OTHER EXPENSES
                      </p>
                      
                      <div className="flex justify-between items-center bg-white p-1 border rounded">
                        <span className="font-sans font-bold uppercase text-[9px] text-gray-400">COMPANY TARGET COGS MARGIN (%):</span>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={companyCostMargin}
                            onChange={(e) => setCompanyCostMargin(Math.max(1, Number(e.target.value)))}
                            className="w-10 border border-gray-300 text-center font-black p-0.5"
                          />
                          <span className="font-black font-sans text-[10px] text-gray-700">%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center bg-transparent px-1">
                        <span className="font-sans font-bold text-gray-500 text-[9px]">LABOR COST (30%):</span>
                        <span className="font-black text-gray-800">{formatMoney(laborCost30)}</span>
                      </div>

                      <div className="flex justify-between items-center bg-transparent px-1">
                        <span className="font-sans font-bold text-gray-500 text-[9px]">OPEX RESERVE (30%):</span>
                        <span className="font-black text-gray-800">{formatMoney(opex30)}</span>
                      </div>

                      <div className="flex justify-between items-center bg-transparent px-1 border-b pb-1">
                        <span className="font-sans font-bold text-gray-500 text-[9px]">VAT / BIR COMPLIANCE TAX (12%):</span>
                        <span className="font-black text-gray-800">{formatMoney(vatTax12)}</span>
                      </div>

                      <div className="flex justify-between items-center bg-gray-900 text-emerald-400 px-2 py-1 rounded font-bold">
                        <span className="font-sans font-black text-[9px] text-gray-300 uppercase">CONSOLIDATED COGS FORMULA:</span>
                        <span className="text-sm font-black">{formatMoney(consolidatedCOGS)}</span>
                      </div>
                    </div>

                    {/* BOTTOM MID SUMMARY SECTION: RAW FOOD COST CALCULATION */}
                    <div 
                      className="p-3 bg-emerald-50/30 space-y-1.5"
                      onClick={() => setFormulaBar('Food cost calculation grid values')}
                    >
                      <p className="font-sans font-black text-emerald-850 uppercase tracking-wider text-[9px] border-b pb-1 mb-1">
                        RAW FOOD COST ANALYSIS
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="font-sans font-extrabold text-[9px] text-gray-500">SUBTOTAL RAW INGREDIENT COST:</span>
                        <strong className="text-gray-900">{formatMoney(subtotalRawFoodCost)}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-sans font-extrabold text-[9px] text-gray-500">FOOD CONTINGENCY CHARGE (10%):</span>
                        <strong className="text-gray-900">{formatMoney(foodContingency10)}</strong>
                      </div>

                      <div className="flex justify-between items-center border-t border-dashed border-gray-300 pt-1">
                        <span className="font-sans font-black text-[9px] text-emerald-900 uppercase">TOTAL FOODCOST BASE SUM:</span>
                        <strong className="text-emerald-900 font-extrabold">{formatMoney(totalFoodCost)}</strong>
                      </div>

                      <div className="flex justify-between items-center bg-emerald-700 text-white px-2 py-1.5 rounded">
                        <span className="font-sans font-black text-[9px] text-emerald-100 uppercase">FOODCOST PER HEAD (PORTION):</span>
                        <strong className="text-xs font-black text-white font-mono">
                          {yieldPax > 0 ? formatMoney(foodCostPerHead) : '#DIV/0!'}
                        </strong>
                      </div>
                    </div>

                  </div>

                </div>

                {/* SPREADSHEET SIDE BLOCKS: ALLERGENS AND NUTRITION FACTS (Right side column) */}
                <div className="col-span-3 space-y-3">
                  
                  {/* Food Allergens Panel Checklist */}
                  <div className="bg-white rounded border border-gray-300 shadow-sm p-3">
                    <p className="text-[9px] font-black text-red-700 uppercase tracking-widest border-b pb-1.5 mb-2 flex items-center gap-1">
                      <AlertCircle size={12} /> FOOD ALLERGENS ACCOUNTABILITY
                    </p>
                    
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {allergenList.map((all) => {
                        const active = allergens.includes(all);
                        return (
                          <div 
                            key={all}
                            onClick={() => toggleAllergen(all)}
                            className={`flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer select-none transition ${
                              active ? 'bg-red-50 text-red-800 font-bold border border-red-200' : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <span className="font-mono text-[9px] font-black w-3 text-center">
                              {active ? '☑' : '☐'}
                            </span>
                            <span className="truncate text-[9.5px]">{all}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nutrition Facts block (screenshot right column) */}
                  <div className="bg-white rounded border border-gray-300 shadow-sm p-3 font-sans relative">
                    
                    <div className="text-center border-b-2 border-black pb-1">
                      <h4 className="text-xs font-black tracking-tight leading-none uppercase">NUTRITION FACTS PANEL</h4>
                      <p className="text-[8px] text-gray-500 font-bold mt-0.5 uppercase">Reference FDA compliant specs</p>
                    </div>

                    <div className="grid grid-cols-1 gap-1 text-[10px] mt-2 font-mono">
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-bold text-[9px] font-sans">Serving Size:</span>
                        <input 
                          type="text" 
                          placeholder="300g"
                          value={nutritionFacts.servingSize || ''}
                          onChange={(e) => setNutritionFacts({...nutritionFacts, servingSize: e.target.value})}
                          className="w-20 border border-gray-200 p-0.5 font-bold text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-bold text-[9px] font-sans">Servings per Cont:</span>
                        <input 
                          type="text" 
                          placeholder="1"
                          value={nutritionFacts.servingsPerContainer || ''}
                          onChange={(e) => setNutritionFacts({...nutritionFacts, servingsPerContainer: e.target.value})}
                          className="w-20 border border-gray-200 p-0.5 font-bold text-right"
                        />
                      </div>
                      <div className="bg-gray-100 p-1 font-bold text-[10px] uppercase font-sans tracking-wider text-black flex justify-between items-center mt-1">
                        <span>CALORIES:</span>
                        <input 
                          type="text" 
                          placeholder="0 kcal"
                          value={nutritionFacts.calories || ''}
                          onChange={(e) => setNutritionFacts({...nutritionFacts, calories: e.target.value})}
                          className="w-20 border border-gray-300 p-0.5 bg-white text-right font-black"
                        />
                      </div>

                      {/* Nutrient rows inputs */}
                      {[
                        { label: 'Total Fat (g)', key: 'totalFat' },
                        { label: 'Saturated Fat (g)', key: 'saturatedFat' },
                        { label: 'Trans Fat (g)', key: 'transfat' },
                        { label: 'Carbohydrates (g)', key: 'carbohydrates' },
                        { label: 'Dietary Fiber (g)', key: 'dietaryFiber' },
                        { label: 'Sugars (g)', key: 'sugars' },
                        { label: 'Added Sugars (g)', key: 'addedSugars' },
                        { label: 'Protein (g)', key: 'protein' },
                        { label: 'Sodium (mg)', key: 'sodium' },
                        { label: 'Calcium (mg)', key: 'calcium' },
                        { label: 'Iron (mg)', key: 'iron' },
                      ].map((nut) => (
                        <div key={nut.key} className="flex justify-between items-center border-b pt-0.5">
                          <span className="text-[9.5px] font-bold text-gray-500 font-sans">{nut.label}:</span>
                          <input 
                            type="text" 
                            placeholder="-"
                            value={nutritionFacts[nut.key] || ''}
                            onChange={(e) => setNutritionFacts({...nutritionFacts, [nut.key]: e.target.value})}
                            className="w-14 border border-transparent hover:border-gray-300 focus:bg-white text-right p-0 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                  </div>

                </div>

              </div>

              {/* ROW SECTION 5: SIGNATORIES AND REQUIRED EQUIPMENT list */}
              <div className="grid grid-cols-12 gap-3">
                
                {/* 1 to 10 Equipment column */}
                <div className="col-span-6 bg-white rounded border border-gray-300 p-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider border-b pb-1.5 mb-2 flex items-center gap-1">
                    📖 Required Kitchen Equipment (HACCP Checklist)
                  </p>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {equipments10.map((equip, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="font-mono text-[9px] text-gray-400 w-3 font-semibold text-right">{i + 1}.</span>
                        <input 
                          type="text"
                          value={equip}
                          onChange={(e) => handleEquipChange(i, e.target.value)}
                          placeholder={`Cooker/Tool ${i + 1}`}
                          className="w-full bg-gray-50 hover:bg-white border border-gray-200 p-0.5 font-sans font-medium text-[11px] focus:outline-none focus:border-emerald-600 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sign-offs block */}
                <div className="col-span-6 bg-white rounded border border-gray-300 p-3 shadow-sm space-y-2 flex flex-col justify-between">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider border-b pb-1 mb-1">
                    ✒️ AUTHENTICATED WORKFLOW ROLES SIGN-OFFS
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    
                    {/* Chef author */}
                    <div className="border border-dashed border-gray-200 p-2 rounded">
                      <span className="text-[8px] font-black uppercase text-gray-400 block">CHEF AUTHOR (PREPARER)</span>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          value={signatoryChef}
                          onChange={(e) => setSignatoryChef(e.target.value)}
                          placeholder="Preparer Chef Signature"
                          className="w-1/2 border border-gray-300 p-1 text-[11px] font-bold"
                        />
                        <input 
                          type="text" 
                          value={signatoryChefPos}
                          onChange={(e) => setSignatoryChefPos(e.target.value)}
                          className="w-1/2 border border-gray-300 p-1 text-[11px] text-gray-500 font-mono bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Approver 1 */}
                    <div className="border border-dashed border-gray-200 p-2 rounded">
                      <span className="text-[8px] font-black uppercase text-gray-400 block">APPROVED FOR PRODUCTION CODE</span>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          value={signatoryApproved1}
                          onChange={(e) => setSignatoryApproved1(e.target.value)}
                          placeholder="Approved Signature 1"
                          className="w-1/2 border border-gray-300 p-1 text-[11px] font-bold"
                        />
                        <input 
                          type="text" 
                          value={signatoryApproved1Pos}
                          onChange={(e) => setSignatoryApproved1Pos(e.target.value)}
                          className="w-1/2 border border-gray-300 p-1 text-[11px] text-gray-500 font-mono bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Approver 2 */}
                    <div className="border border-dashed border-gray-200 p-2 rounded">
                      <span className="text-[8px] font-black uppercase text-gray-400 block">APPROVED RECIPE COMPTROL SIGNATURE</span>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          value={signatoryApproved2}
                          onChange={(e) => setSignatoryApproved2(e.target.value)}
                          placeholder="Approved Signature 2"
                          className="w-1/2 border border-gray-300 p-1 text-[11px] font-bold"
                        />
                        <input 
                          type="text" 
                          value={signatoryApproved2Pos}
                          onChange={(e) => setSignatoryApproved2Pos(e.target.value)}
                          className="w-1/2 border border-gray-300 p-1 text-[11px] text-gray-500 font-mono bg-gray-50"
                        />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* ROW SECTION 6: PROCEDURES / COOKING STEPS TEXT AREA (Screenshot extreme bottom row) */}
              <div 
                className="bg-white rounded border border-gray-300 p-3 shadow-sm"
                onClick={() => setFormulaBar('=STRING("Preparation & Cooking procedures markup steps")')}
              >
                <label className="text-[10px] font-black uppercase text-emerald-800 tracking-wider mb-2 block border-b pb-1">
                  📋 Preparation & Cooking Procedures (Step-by-Step Instructions)
                </label>
                <textarea
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="1. Wash organic raw proteins under standard running water.&#15;2. Slice into 2-inch chunks and preserve temp below 4°C.&#15;3. Saute aromatics slowly in heavy stainless stewpan..."
                  rows={4}
                  className="w-full border border-gray-300 rounded p-2 text-xs font-sans text-gray-700 leading-relaxed font-semibold focus:outline-none focus:border-emerald-600 m-0.5 bg-gray-50 hover:bg-white"
                />
              </div>

            </div>
          </div>
          
          {/* Mock spreadsheet status line */}
          <div className="bg-[#e5e7eb] border-t border-gray-300 px-3 py-1.5 text-[10px] font-mono text-gray-500 flex justify-between items-center select-none font-bold">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-700 text-white rounded px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-tight">READY</span>
              <span className="text-gray-600">Calculated cells: 48 active formulas</span>
            </div>
            <div className="text-gray-600">
              COGS calculated live: (TOTAL_FOODCOST + LABOR(30%) + OPEX(30%) + VAT(12%))
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
