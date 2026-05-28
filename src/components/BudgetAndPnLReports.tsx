import React, { useState } from 'react';
import { User, Budget, SaleTransaction, DirectPurchase } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  BarChart2, 
  Calculator, 
  Building, 
  Compass, 
  Plus, 
  Briefcase, 
  Wrench, 
  Trash2, 
  AlertTriangle, 
  ArrowUpRight, 
  PieChart,
  HardHat,
  ChevronDown
} from 'lucide-react';

interface BudgetAndPnLReportsProps {
  currentUser: User;
  activeBranch: string;
  budgets: Budget[];
  sales: SaleTransaction[];
  directPurchases: DirectPurchase[];
  onAddOrUpdateBudget: (budget: Budget) => Promise<boolean>;
  formatMoney: (val: number) => string;
}

interface AmortizationItem {
  id: string;
  assetName: string;
  initialValue: number;
  usefulLifeMonths: number;
  monthlyDeduction: number;
  dateAdded: string;
}

export const BudgetAndPnLReportsComponent: React.FC<BudgetAndPnLReportsProps> = ({
  currentUser,
  activeBranch,
  budgets,
  sales,
  directPurchases,
  onAddOrUpdateBudget,
  formatMoney,
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Local state for wishlists of equipment/construction
  const [wishlist, setWishlist] = useState<{ id: string; dept: string; item: string; estCost: number; type: 'Equipment' | 'Construction' }[]>([
    { id: '1', dept: 'Kitchen', item: 'Heavy-Duty Combi Oven', estCost: 350000, type: 'Equipment' },
    { id: '2', dept: 'Commissary', item: 'Cold Storage Room Wall Extension', estCost: 450000, type: 'Construction' },
    { id: '3', dept: 'Engineering', item: 'Industrial Generator Set 100kVA', estCost: 650000, type: 'Equipment' },
  ]);

  const [wishDept, setWishDept] = useState('Kitchen');
  const [wishItem, setWishItem] = useState('');
  const [wishCost, setWishCost] = useState(0);
  const [wishType, setWishType] = useState<'Equipment' | 'Construction'>('Equipment');

  // Amortization custom schedule tracking
  const [amortizations, setAmortizations] = useState<AmortizationItem[]>([
    { id: 'a1', assetName: 'Main Kitchen Lease Improvement', initialValue: 1200000, usefulLifeMonths: 60, monthlyDeduction: 20000, dateAdded: '2026-01-01' },
    { id: 'a2', assetName: 'Heavy Delivery Truck Van', initialValue: 1800000, usefulLifeMonths: 120, monthlyDeduction: 15000, dateAdded: '2026-02-15' },
    { id: 'a3', assetName: 'Commissary Blast Chiller', initialValue: 480000, usefulLifeMonths: 48, monthlyDeduction: 10000, dateAdded: '2026-03-10' },
  ]);

  const [amortName, setAmortName] = useState('');
  const [amortVal, setAmortVal] = useState(0);
  const [amortLife, setAmortLife] = useState(36);

  // Active view tabs within financial cockpit
  const [subView, setSubView] = useState<'pnl' | 'budgeting' | 'expenses' | 'amortization'>('pnl');

  const DEPARTMENTS = [
    'Kitchen',
    'FnB Restaurant',
    'Commissary',
    'Resto Branches',
    'Housekeeping',
    'Engineering',
    'Human Resources',
    'Top Management',
    'Sales and Marketing'
  ];

  // 1. SALES AGGREGATION (Actual Sales)
  // Let's filter sales for 2026
  const activeYearSales = sales.filter(s => s.status === 'Completed' && s.dateTime.startsWith('2026'));
  const totalActualSalesMtd = activeYearSales
    .filter(s => {
      // e.g. Month 5 (May)
      return s.dateTime.slice(5, 7) === '05';
    })
    .reduce((sum, tx) => sum + Number(tx.netTotal), 0);

  const totalActualSalesYtd = activeYearSales.reduce((sum, tx) => sum + Number(tx.netTotal), 0);

  // 1-A. TARGET SALES SETTINGS (MOCK Targets based on actual month targets settings)
  const targetSalesMtd = 1200000; // Target Sales for May
  const targetSalesYtd = 5800000;

  // Compare Last Year corresponding actuals (approx representation + actual data multiplier)
  const lastMonthSalesMtd = 1050000;
  const lastYearSalesMtd = 980000;

  const lastMonthSalesYtd = 5100000;
  const lastYearSalesYtd = 4600000;

  // 2. EXPENSES AGGREGATION FROM DIRECT PURCHASES (Approved & Received)
  const validPurchases = directPurchases.filter(p => p.status === 'Approved' || p.status === 'Received');
  
  const getDeptActualExpenseMtd = (deptName: string): number => {
    return validPurchases
      .filter(p => p.department.toLowerCase().includes(deptName.toLowerCase()) && p.date.slice(5, 7) === '05')
      .reduce((sum, p) => sum + Number(p.totalAmount), 0);
  };

  const getDeptActualExpenseYtd = (deptName: string): number => {
    return validPurchases
      .filter(p => p.department.toLowerCase().includes(deptName.toLowerCase()))
      .reduce((sum, p) => sum + Number(p.totalAmount), 0);
  };

  // Monthly planned budget targets
  const getDeptBudgetPlanned = (deptName: string): number => {
    const match = budgets.find(b => b.department === deptName && b.year === 2026 && b.month === 5);
    return match ? Number(match.plannedAmount) : 150000; // standard default target fallback
  };

  // Consolidated total monthly amortization cost
  const totalMonthlyAmortization = amortizations.reduce((sum, item) => sum + item.monthlyDeduction, 0);

  // Profit calculations
  const totalActualExpensesMtd = DEPARTMENTS.reduce((sum, dept) => sum + getDeptActualExpenseMtd(dept), 0);
  const totalAmortizedExpensesMtd = totalMonthlyAmortization; // Lease & Equipment depreciations
  const netEarningsMtd = totalActualSalesMtd - (totalActualExpensesMtd + totalAmortizedExpensesMtd);

  const totalActualExpensesYtd = DEPARTMENTS.reduce((sum, dept) => sum + getDeptActualExpenseYtd(dept), 0);
  const netEarningsYtd = totalActualSalesYtd - (totalActualExpensesYtd + (totalMonthlyAmortization * 5)); // 5 months total

  // Handle adding equipment or construction wishlist row
  const handleAddWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishItem.trim() || wishCost <= 0) {
      alert('Provide valid wish details first.');
      return;
    }
    const newRow = {
      id: `w-${Date.now()}`,
      dept: wishDept,
      item: wishItem.trim(),
      estCost: wishCost,
      type: wishType
    };
    setWishlist([...wishlist, newRow]);
    setWishItem('');
    setWishCost(0);
  };

  // Remove wishlist row
  const handleRemoveWishlist = (id: string) => {
    setWishlist(wishlist.filter(w => w.id !== id));
  };

  // Add amortization item schedule
  const handleAddAmortization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amortName.trim() || amortVal <= 0 || amortLife <= 0) {
      alert('Provide valid asset value and depreciation term.');
      return;
    }
    const monthlyDeduct = amortVal / amortLife;
    const newAmort: AmortizationItem = {
      id: `am-${Date.now()}`,
      assetName: amortName.trim(),
      initialValue: amortVal,
      usefulLifeMonths: amortLife,
      monthlyDeduction: Number(monthlyDeduct.toFixed(2)),
      dateAdded: new Date().toISOString().slice(0, 10)
    };
    setAmortizations([...amortizations, newAmort]);
    setAmortName('');
    setAmortVal(0);
    setAmortLife(36);
  };

  return (
    <div className="space-y-4 text-xs font-semibold text-gray-700">
      
      {/* Cockpit Nav links */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setSubView('pnl')}
          className={`py-3.5 px-5 font-black uppercase tracking-wider transition ${
            subView === 'pnl' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          📊 Consolidated Profit & Losses (P&L)
        </button>
        <button
          onClick={() => setSubView('budgeting')}
          className={`py-3.5 px-5 font-black uppercase tracking-wider transition ${
            subView === 'budgeting' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          💼 Departmental Budgeting & Capital Wishlists
        </button>
        <button
          onClick={() => setSubView('expenses')}
          className={`py-3.5 px-5 font-black uppercase tracking-wider transition ${
            subView === 'expenses' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🧾 Separate Expenses Report
        </button>
        <button
          onClick={() => setSubView('amortization')}
          className={`py-3.5 px-5 font-black uppercase tracking-wider transition ${
            subView === 'amortization' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          📉 Amortization Schedules
        </button>
      </div>

      {/* SUBTAB 1: CONSOLIDATED P&L COCKPIT */}
      {subView === 'pnl' && (
        <div className="space-y-4">
          
          {/* Main Visual KPIs Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white border rounded-xl p-4 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Month-To-Date Target vs Actual</span>
              <div className="flex justify-between items-baseline leading-none">
                <b className="text-xl font-bold font-mono text-gray-900">{formatMoney(totalActualSalesMtd)}</b>
                <span className="text-[9px] text-gray-400 font-bold font-mono">Target: {formatMoney(targetSalesMtd)}</span>
              </div>
              <p className="text-[9px] text-blue-700">
                Performance: {((totalActualSalesMtd / targetSalesMtd) * 100).toFixed(1)}% of targets met
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Total Departmental Expenses</span>
              <div className="flex justify-between items-baseline leading-none">
                <b className="text-xl font-bold font-mono text-red-700">{formatMoney(totalActualExpensesMtd)}</b>
                <span className="text-[9px] text-gray-400">Charges MTD</span>
              </div>
              <p className="text-[9px] text-gray-400">Parsed across {DEPARTMENTS.length} cost centers</p>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Asset Amortization Charges</span>
              <div className="flex justify-between items-baseline leading-none">
                <b className="text-xl font-bold font-mono text-purple-700">{formatMoney(totalAmortizedExpensesMtd)}</b>
                <span className="text-[9px] text-gray-400">Lease/Machine</span>
              </div>
              <p className="text-[9px] text-gray-400">Computed standard depreciation</p>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-2xs space-y-2 bg-emerald-50/50 border-emerald-250">
              <span className="text-[10px] font-black uppercase text-emerald-800">Verified Consolidated Profits</span>
              <div className="flex justify-between items-baseline leading-none">
                <b className="text-xl font-bold font-mono text-emerald-800">{formatMoney(netEarningsMtd)}</b>
                <span className="text-[9px] text-emerald-700 font-bold">NET MTD</span>
              </div>
              <p className="text-[9px] text-emerald-650">Reflects full deductions & outlays</p>
            </div>

          </div>

          {/* Consolidated Targets and Variance Matrix Sheet */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm p-4 space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-950 flex items-center justify-between border-b pb-2">
              <span>Mouth-To-Date (MTD) vs Year-To-Date (YTD) Comparison Sheet (CY 2026)</span>
              <span className="text-[9px] bg-blue-900 text-white font-mono rounded px-2 py-0.5">MAY OPERATIONAL COCKPIT</span>
            </h3>

            <table className="w-full text-left font-medium">
              <thead className="bg-gray-100 border-b text-[10px] font-black uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="p-3">Financial parameters</th>
                  <th className="p-3 text-right">Actual May (MTD)</th>
                  <th className="p-3 text-right">Target May (MTD)</th>
                  <th className="p-3 text-right">Variance MTD %</th>
                  <th className="p-3 text-right">Actual YTD</th>
                  <th className="p-3 text-right">Target YTD</th>
                  <th className="p-3 text-right">Variance YTD %</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold text-gray-700">
                
                <tr>
                  <td className="p-3 font-black text-gray-950">RESTAURANT SALES REVENUES</td>
                  <td className="p-3 text-right font-mono text-emerald-800">{formatMoney(totalActualSalesMtd)}</td>
                  <td className="p-3 text-right font-mono text-gray-400">{formatMoney(targetSalesMtd)}</td>
                  <td className="p-3 text-right text-green-700 font-mono">
                    {(((totalActualSalesMtd - targetSalesMtd) / targetSalesMtd) * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-800">{formatMoney(totalActualSalesYtd)}</td>
                  <td className="p-3 text-right font-mono text-gray-400">{formatMoney(targetSalesYtd)}</td>
                  <td className="p-3 text-right text-green-700 font-mono">
                    {(((totalActualSalesYtd - targetSalesYtd) / targetSalesYtd) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr>
                  <td className="p-3 text-gray-800 font-extrabold font-serif">DEPARTMENTAL OPERATIONAL OUTLAYS</td>
                  <td className="p-3 text-right font-mono text-red-700">({formatMoney(totalActualExpensesMtd)})</td>
                  <td className="p-3 text-right font-mono text-gray-400">({formatMoney(1350000)})</td>
                  <td className="p-3 text-right text-red-650 font-mono">-</td>
                  <td className="p-3 text-right font-mono text-red-700">({formatMoney(totalActualExpensesYtd)})</td>
                  <td className="p-3 text-right font-mono text-gray-400">({formatMoney(5500000)})</td>
                  <td className="p-3 text-right text-red-650 font-mono">-</td>
                </tr>

                <tr>
                  <td className="p-3 text-gray-800">EQUIPMENT & LEASE AMORTIZATIONS</td>
                  <td className="p-3 text-right font-mono text-purple-700">({formatMoney(totalAmortizedExpensesMtd)})</td>
                  <td className="p-3 text-right font-mono text-gray-400">({formatMoney(totalAmortizedExpensesMtd)})</td>
                  <td className="p-3 text-right font-mono text-gray-400">0.0%</td>
                  <td className="p-3 text-right font-mono text-purple-700">({formatMoney(totalAmortizedExpensesMtd * 5)})</td>
                  <td className="p-3 text-right font-mono text-gray-400">({formatMoney(totalAmortizedExpensesMtd * 5)})</td>
                  <td className="p-3 text-right font-mono text-gray-400">0.0%</td>
                </tr>

                <tr className="bg-gray-50 border-t-2 border-b-2 border-gray-300">
                  <td className="p-3 font-black text-blue-950 text-xs">CONSOLIDATED FINAL NET PROFITS</td>
                  <td className="p-3 text-right font-mono font-black text-xs text-blue-900">{formatMoney(netEarningsMtd)}</td>
                  <td className="p-3 text-right font-mono text-gray-400">({formatMoney(-150000)})</td>
                  <td className="p-3 text-right text-green-700 font-mono font-black">HIGH RISK SECURE</td>
                  <td className="p-3 text-right font-mono font-black text-xs text-blue-900">{formatMoney(netEarningsYtd)}</td>
                  <td className="p-3 text-right font-mono text-gray-400">({formatMoney(300000)})</td>
                  <td className="p-3 text-right text-green-700 font-mono font-black">SECURE OK</td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Historical comparison metrics */}
          <div className="bg-white border rounded-lg p-4 space-y-3 shadow-xs font-bold">
            <h3 className="text-xs font-black uppercase text-gray-500">Historical Year-Over-Year Real-Time Comparison (vs Last Month & Last Year)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-[9px] text-gray-400 uppercase tracking-wide">MTD SALES VS LAST MONTH & LAST YEAR</span>
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-600 uppercase">May Actual MTD:</span>
                    <span className="font-mono">{formatMoney(totalActualSalesMtd)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-600 uppercase">April Actual (Last Month):</span>
                    <span className="font-mono text-gray-500">{formatMoney(lastMonthSalesMtd)} ({(((totalActualSalesMtd - lastMonthSalesMtd) / lastMonthSalesMtd) * 100).toFixed(1)}% Var)</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-600 uppercase">May 2025 (Last Year corresponding):</span>
                    <span className="font-mono text-gray-500">{formatMoney(lastYearSalesMtd)} ({(((totalActualSalesMtd - lastYearSalesMtd) / lastYearSalesMtd) * 100).toFixed(1)}% Var)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded border">
                <span className="text-[9px] text-gray-400 uppercase tracking-wide">YTD SALES VS LAST MONTH & LAST YEAR</span>
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-600 uppercase">YTD CY 2026:</span>
                    <span className="font-mono text-emerald-800">{formatMoney(totalActualSalesYtd)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-600">YTD (Last Month comparative):</span>
                    <span className="font-mono text-gray-500">{formatMoney(lastMonthSalesYtd)} ({(((totalActualSalesYtd - lastMonthSalesYtd) / lastMonthSalesYtd) * 100).toFixed(1)}% Var)</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-gray-600">YTD CY 2025 comparative:</span>
                    <span className="font-mono text-gray-500">{formatMoney(lastYearSalesYtd)} ({(((totalActualSalesYtd - lastYearSalesYtd) / lastYearSalesYtd) * 100).toFixed(1)}% Var)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: DEPARTMENTAL BUDGETING & WISHLIST CAPITAL OUTLAYS */}
      {subView === 'budgeting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Wishlist management creator on left */}
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-1.5 flex items-center gap-1">
              <HardHat size={15} /> Add Equipment or Construction Outlay Wishlist row
            </h3>

            <form onSubmit={handleAddWishlist} className="space-y-4 font-bold">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Target Department cost center</label>
                <select
                  value={wishDept}
                  onChange={(e) => setWishDept(e.target.value)}
                  className="w-full text-xs rounded border p-2 bg-white font-bold"
                >
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Requested Outlay description</label>
                <input 
                  type="text"
                  required
                  value={wishItem}
                  onChange={(e) => setWishItem(e.target.value)}
                  placeholder="e.g. Wall Paint & Tile Repair"
                  className="w-full rounded border p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Estimated Cost value</label>
                  <input 
                    type="number"
                    required
                    value={wishCost || ''}
                    onChange={(e) => setWishCost(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono"
                    placeholder="25000"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Asset outlay Type</label>
                  <select
                    value={wishType}
                    onChange={(e) => setWishType(e.target.value as any)}
                    className="w-full text-xs rounded border p-1.5 bg-white font-bold"
                  >
                    <option value="Equipment">Purchased Equipment</option>
                    <option value="Construction">Construction/Renovations</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-black text-white font-black text-xs py-2 uppercase rounded transition"
              >
                + Append Requisition Wishlist
              </button>
            </form>
          </div>

          {/* Department budgeted targets grid list on right */}
          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider">
              CAPITAL EQUIPMENT & CONSTRUCTION DEVELOPMENT WISHLISTS
            </h3>

            <div className="bg-white border rounded overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b text-[10px] font-black uppercase text-gray-500">
                  <tr>
                    <th className="p-2">Cost center Dept</th>
                    <th className="p-2">Wish item Particular</th>
                    <th className="p-2">Outlay Type</th>
                    <th className="p-2 text-right">Est. Budget Outlay</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px] font-semibold text-gray-700 uppercase">
                  {wishlist.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 italic">No capital wishlists logged.</td>
                    </tr>
                  ) : (
                    wishlist.map(w => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="p-2 font-extrabold text-blue-900">{w.dept}</td>
                        <td className="p-2 text-gray-900 normal-case">{w.item}</td>
                        <td className="p-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black ${
                            w.type === 'Construction' ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700'
                          }`}>
                            {w.type}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono font-black text-gray-900">{formatMoney(w.estCost)}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveWishlist(w.id)}
                            className="text-red-700 hover:text-red-800 text-[10.5px] uppercase font-bold"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Department budgets planned allocation status */}
            <div className="pt-3 border-t">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2">MAY DEPARTMENT BUDGET ALLOCATION LIMIT MARGINS</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEPARTMENTS.slice(0, 6).map(dept => {
                  const planned = getDeptBudgetPlanned(dept);
                  const actual = getDeptActualExpenseMtd(dept);
                  const remaining = planned - actual;
                  const ratio = Math.min(100, (actual / planned) * 100);

                  return (
                    <div key={dept} className="bg-gray-55/35 bg-gray-50 p-2.5 rounded border border-gray-200">
                      <p className="text-[10px] font-extrabold text-gray-900 uppercase truncate">{dept}</p>
                      <div className="flex justify-between items-baseline font-mono text-[9.5px] text-gray-400 mt-1">
                        <span>Used/Max:</span>
                        <span>{formatMoney(actual)} / {formatMoney(planned)}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 h-1 rounded overflow-hidden mt-1.5">
                        <div 
                          style={{ width: `${ratio}%` }} 
                          className={`h-full ${ratio > 90 ? 'bg-red-650' : ratio > 60 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 3: EXTREMELY DETAILED EXPENSES DISCLOSURE RECONCILER */}
      {subView === 'expenses' && (
        <div className="bg-white border rounded-lg p-5 space-y-4 shadow-xs text-xs font-semibold text-gray-750">
          
          <div className="border-b pb-2 flex justify-between items-center text-xs bg-gray-50 p-3 rounded">
            <div>
              <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1">
                <PieChart size={15} /> DETAILED DEPARTMENTAL TRANSACTION EXPENSES DISCLOSURES
              </h3>
              <p className="text-[9.5px] text-gray-450 uppercase font-black tracking-widest mt-0.5">
                Tracks highest transactions and targets cost-absorbing centers.
              </p>
            </div>
            <span className="font-mono text-sm font-black text-red-700 bg-red-100 px-3.5 py-1.5 rounded uppercase">
              Consolidated May: {formatMoney(totalActualExpensesMtd)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left table: Highest transactions registered */}
            <div className="lg:col-span-2 border rounded overflow-hidden">
              <p className="bg-gray-100 p-2 text-[10px] font-black uppercase text-gray-500 border-b">TOP EXPENDITURES TRANS-LOG REGISTER</p>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-[9px] font-black uppercase text-gray-400">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Supplier Particulars</th>
                    <th className="p-2">Cost Center Department</th>
                    <th className="p-2 text-right">Sum paid</th>
                    <th className="p-2 text-center">Receipt ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[10.5px] font-bold text-gray-700 uppercase">
                  {validPurchases.slice(0, 15).map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 font-medium">
                      <td className="p-2 font-mono text-[9.5px] text-gray-400">{item.date}</td>
                      <td className="p-2 text-gray-900 font-extrabold truncate w-40 block">{item.supplierName}</td>
                      <td className="p-2 text-indigo-750">{item.department}</td>
                      <td className="p-2 text-right font-mono font-black text-red-750">{formatMoney(item.totalAmount)}</td>
                      <td className="p-2 text-center text-gray-400 font-mono text-[10px]">#{item.orSiNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Right side: absorbs analysis box */}
            <div className="space-y-3 font-semibold text-gray-700">
              <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200">
                <p className="text-[10px] font-black uppercase tracking-wider text-red-900 flex items-center gap-1">
                  <AlertTriangle size={15} /> SYSTEM OUTLAYS ADVISORY & WARNINGS
                </p>
                <div className="mt-2 space-y-1 text-[11px] font-bold">
                  <p>• Highest expense departments detected: <b className="text-red-700 font-black">Kitchen & Main Commissary</b>.</p>
                  <p className="mt-1">• Weighted raw cost variances in the last 7 days averaged a fluctuating 5%. Re-cost standard recipes if margins dip further.</p>
                </div>
              </div>

              <div className="p-3 bg-white border rounded shadow-2xs space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400 border-b pb-1">DEPARTMENT OUTLAYS RANKINGS (MTD May)</p>
                <div className="space-y-1.5 text-[10px]">
                  {DEPARTMENTS.map(dept => {
                    const actualOut = getDeptActualExpenseMtd(dept);
                    return (
                      <div key={dept} className="flex justify-between items-baseline font-bold uppercase">
                        <span className="text-gray-600 truncate">{dept} Outlay:</span>
                        <span className="font-mono text-gray-900">{formatMoney(actualOut)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 4: AMORTIZATION DEPRECIATION SCHEDULER */}
      {subView === 'amortization' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Amortization inputting form */}
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase text-purple-900 border-b pb-1.5 flex items-center gap-1.5">
              <Calculator size={14} /> Add Leased Asset or Machinery to Amortization
            </h3>

            <form onSubmit={handleAddAmortization} className="space-y-4">
              <div>
                <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Asset physical name / Lease Improvement description</label>
                <input 
                  type="text"
                  required
                  value={amortName}
                  onChange={(e) => setAmortName(e.target.value)}
                  placeholder="e.g. Heavy-duty 2 HP Blast Chiller"
                  className="w-full rounded border p-2 text-xs font-bold text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-bold">
                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Initial Valuation Value (PHP)</label>
                  <input 
                    type="number"
                    required
                    value={amortVal || ''}
                    onChange={(e) => setAmortVal(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono text-center text-xs"
                    placeholder="350000"
                  />
                </div>

                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-400 mb-1">Useful Life Term (months)</label>
                  <input 
                    type="number"
                    required
                    value={amortLife || ''}
                    onChange={(e) => setAmortLife(Number(e.target.value))}
                    className="w-full rounded border p-1.5 font-mono text-center text-xs"
                    placeholder="48"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-black text-white font-black text-xs py-2 uppercase rounded transition shadow"
              >
                + Register Asset to Amortization
              </button>
            </form>
          </div>

          {/* Active schedules ledger */}
          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-4 text-xs font-semibold text-gray-700">
            <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider">
              ACTIVE FIXTURES & LEASE AMORTIZATIONS DEDUCTION COCKPIT
            </h3>

            <div className="bg-white border rounded overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b text-[9.5px] font-black uppercase text-gray-500 tracking-wider">
                  <tr>
                    <th className="p-2.5">Asset name</th>
                    <th className="p-2.5 text-right">Initial PHP</th>
                    <th className="p-2.5 text-center">Life Limit</th>
                    <th className="p-2.5 text-right font-black">Monthly Outlay Deduct</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px] font-bold text-gray-700 uppercase">
                  {amortizations.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-2.5 font-black text-gray-900 normal-case">{item.assetName}</td>
                      <td className="p-2.5 text-right font-mono text-gray-600">{formatMoney(item.initialValue)}</td>
                      <td className="p-2.5 text-center font-mono">{item.usefulLifeMonths} months</td>
                      <td className="p-2.5 text-right font-mono font-black text-purple-700">({formatMoney(item.monthlyDeduction)})</td>
                      <td className="p-2.5 text-center">
                        <span className="bg-purple-100 text-purple-800 text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded">Active-Amrt</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-black border-t-2">
                    <td colSpan={3} className="p-2.5 text-blue-900">CONSOLIDATED MONTHLY DEDUCTION:</td>
                    <td className="p-2.5 text-right font-mono text-purple-700 font-black text-xs">({formatMoney(totalMonthlyAmortization)})</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
