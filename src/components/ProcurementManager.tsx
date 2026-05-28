import React, { useState } from 'react';
import { User, DirectPurchase, Branch, Budget, TaxInfo } from '../types';
import { 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  Printer, 
  Users, 
  BellRing, 
  Wallet, 
  Check, 
  Clock, 
  FileCheck,
  Building,
  ArrowUpRight
} from 'lucide-react';

interface ProcurementManagerProps {
  currentUser: User;
  activeBranch: string;
  directPurchases: DirectPurchase[];
  branches: Branch[];
  budgets: Budget[];
  onAddOrUpdatePurchase: (purchase: DirectPurchase) => Promise<boolean>;
  onAddOrUpdateBudget: (budget: Budget) => Promise<boolean>;
  formatMoney: (val: number) => string;
  taxInfo: TaxInfo;
}

export const ProcurementManagerComponent: React.FC<ProcurementManagerProps> = ({
  currentUser,
  activeBranch,
  directPurchases,
  branches,
  budgets,
  onAddOrUpdatePurchase,
  onAddOrUpdateBudget,
  formatMoney,
  taxInfo,
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states of Direct Purchase
  const [supplierName, setSupplierName] = useState('Baguio Agri Foods Corp');
  const [supplierBrand, setSupplierBrand] = useState('Baguio Agri');
  const [supplierContact, setSupplierContact] = useState('0917-8889999');
  const [supplierAddress, setSupplierAddress] = useState('Central Baguio Agri Trading Base');
  const [supplierTin, setSupplierTin] = useState('244-123-456-000');
  const [orSiNo, setOrSiNo] = useState('');
  const [pcvNo, setPcvNo] = useState('');
  const [chargeDept, setChargeDept] = useState('Kitchen');
  const [expenseType, setExpenseType] = useState<'Food Item' | 'Non-Food Item' | 'Other Expenses'>('Food Item');
  const [selectedDateTime, setSelectedDateTime] = useState<string>(() => {
    // defaults to current local datetime
    return new Date().toISOString().slice(0, 16);
  });

  // Requisition lines
  const [lines, setLines] = useState<{ name: string; qty: number; unit: string; unitPrice: number }[]>([
    { name: '', qty: 10, unit: 'kg', unitPrice: 50 }
  ]);

  // Selected purchase for Print Preview Overlay
  const [printTarget, setPrintTarget] = useState<DirectPurchase | null>(null);

  // Filter purchases by active branch constraints
  const isBranchRestricted = currentUser.role !== 'Admin';
  const scopedRequests = directPurchases.filter(p => {
    if (isBranchRestricted && p.branchId !== activeBranch) return false;
    return true;
  });

  // Approved vs Pending counts
  const pendingRequests = scopedRequests.filter(p => p.status === 'Pending');
  const approvedRequests = scopedRequests.filter(p => p.status === 'Approved' || p.status === 'Received');

  // Supplier Preset Directory Loader
  const handleLoadPresetSupplier = (presetName: string) => {
    if (presetName === 'Baguio Agri Foods Corp') {
      setSupplierName('Baguio Agri Foods Corp');
      setSupplierBrand('Baguio Premium');
      setSupplierContact('0917-8889999');
      setSupplierAddress('Central Baguio Agri Trading Base');
      setSupplierTin('244-123-456-000');
    } else if (presetName === 'PH Meat Supply Inc') {
      setSupplierName('PH Meat Supply Inc');
      setSupplierBrand('Pampanga Farms');
      setSupplierContact('0922-3114421');
      setSupplierAddress('Unit 15, Food Terminal Complex, Taguig');
      setSupplierTin('192-321-445-000');
    } else if (presetName === 'Manila Poultry Distrib') {
      setSupplierName('Manila Poultry Distrib');
      setSupplierBrand('Manila Fine');
      setSupplierContact('0918-9214432');
      setSupplierAddress('Gate 3, Manila Bay Warehouse D, Tondo');
      setSupplierTin('554-123-221-001');
    } else if (presetName === 'Universal Hotel Consumables') {
      setSupplierName('Universal Hotel Consumables');
      setSupplierBrand('HotelCare');
      setSupplierContact('0915-4422110');
      setSupplierAddress('Espana Blvd, Sampaloc, Manila');
      setSupplierTin('882-990-111-000');
    }
  };

  // Requisition lines updater
  const handleAddLine = () => {
    setLines([...lines, { name: '', qty: 1, unit: 'pcs', unitPrice: 100 }]);
  };

  const handleUpdateLine = (idx: number, field: string, val: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: val };
    setLines(updated);
  };

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== idx));
  };

  // Submission handler
  const handleCreateRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const clean = lines.filter(l => l.name.trim() !== '');
    if (clean.length === 0) {
      setErrorMsg('Please enter at least one valid item line to purchase.');
      return;
    }

    try {
      // Determine default authorization: Managers request as 'Pending', Admins/Owners/Purchasers can directly file 'Approved' or 'Pending'
      const canApproveDirectly = currentUser.role === 'Admin' || currentUser.role === 'HR Admin';
      const status: 'Pending' | 'Approved' = canApproveDirectly ? 'Approved' : 'Pending';

      const totalCalculated = clean.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);

      const payload: DirectPurchase = {
        id: `dp-${Date.now()}`,
        date: selectedDateTime.slice(0, 10),
        dateTime: selectedDateTime,
        supplierName,
        supplierBrand,
        contactInfo: supplierContact,
        address: supplierAddress,
        tin: supplierTin,
        orSiNo: orSiNo || `SI-${Date.now().toString().slice(-4)}`,
        pcvNo: pcvNo || `PCV-${Date.now().toString().slice(-4)}`,
        department: chargeDept,
        branchId: activeBranch,
        items: clean.map(item => ({
          name: item.name + (expenseType !== 'Food Item' ? ` (${expenseType})` : ''),
          qty: item.qty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.qty * item.unitPrice
        })),
        totalAmount: totalCalculated,
        status: status
      };

      const ok = await onAddOrUpdatePurchase(payload);
      if (ok) {
        // If directly approved, subtract from relative departmental budgets
        if (status === 'Approved') {
          const year = parseInt(selectedDateTime.slice(0, 4));
          const month = parseInt(selectedDateTime.slice(5, 7));

          const matchingBudget = budgets.find(
            b => b.year === year && b.month === month && b.department === chargeDept
          );

          if (matchingBudget) {
            const updated = {
              ...matchingBudget,
              actualAmount: Number(matchingBudget.actualAmount || 0) + totalCalculated
            };
            await onAddOrUpdateBudget(updated);
          } else {
            // create new budget record for that branch dept
            const newB: Budget = {
              id: `b-${Date.now()}`,
              year,
              month,
              department: chargeDept,
              plannedAmount: 150000, // default target placeholder
              actualAmount: totalCalculated
            };
            await onAddOrUpdateBudget(newB);
          }
        }

        setSuccessMsg(
          status === 'Approved' 
            ? `Successfully filed and APPROVED purchase of ${clean.length} assets! Totaled ${formatMoney(totalCalculated)}.`
            : `Filed PURCHASE REQUEST pending Admin override approval. Blinking alert raised trigger!`
        );

        // Reset
        setOrSiNo('');
        setPcvNo('');
        setLines([{ name: '', qty: 10, unit: 'kg', unitPrice: 50 }]);
      } else {
        setErrorMsg('Error committing purchase request to the operational database.');
      }
    } catch (err) {
      setErrorMsg('Error sending database payload.');
    }
  };

  // Admin approval dispatcher
  const handleAdminApprove = async (po: DirectPurchase) => {
    try {
      setSuccessMsg('');
      setErrorMsg('');

      const updated: DirectPurchase = {
        ...po,
        status: 'Approved'
      };

      const success = await onAddOrUpdatePurchase(updated);
      if (success) {
        // Charge budget
        const year = parseInt(po.date.slice(0, 4)) || 2026;
        const month = parseInt(po.date.slice(5, 7)) || 5;

        const matchingBudget = budgets.find(
          b => b.year === year && b.month === month && b.department === po.department
        );

        if (matchingBudget) {
          const updatedBudget = {
            ...matchingBudget,
            actualAmount: Number(matchingBudget.actualAmount || 0) + Number(po.totalAmount)
          };
          await onAddOrUpdateBudget(updatedBudget);
        } else {
          const newBudget: Budget = {
            id: `b-${Date.now()}`,
            year,
            month,
            department: po.department,
            plannedAmount: 200000,
            actualAmount: po.totalAmount
          };
          await onAddOrUpdateBudget(newBudget);
        }

        setSuccessMsg(`Admin Cleared: Purchased request for ${po.department} successfully approved and funded.`);
      }
    } catch (e) {
      setErrorMsg('Approval process encountered an error.');
    }
  };

  return (
    <div className="space-y-4 text-xs font-semibold text-gray-700">
      
      {/* Dynamic Alarm / Notification indicator panel of requested purchases */}
      {pendingRequests.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-xl flex items-center justify-between animate-pulse shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white rounded-full p-2 animate-bounce">
              <BellRing size={18} />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-red-900 tracking-wider">
                🚨 DIRECT REQUISITION PROCUREMENT ALARM ACTIVE
              </p>
              <p className="text-[10px] text-red-750 uppercase font-black">
                There are <b className="text-xs text-red-650">{pendingRequests.length}</b> manual purchase requests from departments awaiting Admin/Owner authorization.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5 max-w-lg justify-end">
            {pendingRequests.map(po => (
              <span key={po.id} className="bg-red-950 text-white font-black text-[9px] uppercase px-2.5 py-1 rounded inline-flex items-center gap-1">
                {po.department} branch req • {formatMoney(po.totalAmount)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Direct Purchase Form */}
        <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-4">
          <div className="border-b pb-2 flex justify-between items-center bg-gray-50 p-2.5 rounded">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1 leading-none">
                <ShoppingBag size={15} /> Standard Bookkeeper Supplier Directory Purchase Sheet
              </h2>
              <p className="text-[9px] text-gray-400 uppercase font-bold mt-1">Manual Input & Printable Format Requisition Formulars</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase">Preset:</span>
              <select 
                onChange={(e) => handleLoadPresetSupplier(e.target.value)}
                className="rounded border border-gray-300 p-1 font-bold text-[10px] bg-white text-gray-800"
              >
                <option value="Baguio Agri Foods Corp">Baguio Agri Foods Corp</option>
                <option value="PH Meat Supply Inc">PH Meat Supply-Pampanga</option>
                <option value="Manila Poultry Distrib">Manila Poultry (Tondo)</option>
                <option value="Universal Hotel Consumables">Universal Hotel Supplies</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleCreateRequestSubmit} className="space-y-4 font-bold">
            
            {/* Datetime selection block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Transaction date, time & year</label>
                <input 
                  type="datetime-local"
                  required
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 font-bold text-gray-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Invoice / OR / SI Number</label>
                <input 
                  type="text"
                  required
                  value={orSiNo}
                  onChange={(e) => setOrSiNo(e.target.value)}
                  placeholder="SI-2022"
                  className="w-full rounded border border-gray-300 p-1.5 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">PCV Voucher Number</label>
                <input 
                  type="text"
                  required
                  value={pcvNo}
                  onChange={(e) => setPcvNo(e.target.value)}
                  placeholder="PCV-092"
                  className="w-full rounded border border-gray-300 p-1.5 text-xs text-gray-800"
                />
              </div>
            </div>

            {/* Supplier detailed attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded border border-gray-200">
              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Company / Supplier name</label>
                <input 
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 text-[11px] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Supplier Brand Name</label>
                <input 
                  type="text"
                  required
                  value={supplierBrand}
                  onChange={(e) => setSupplierBrand(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 text-[11px] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Supplier Contact Info</label>
                <input 
                  type="text"
                  required
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 text-[11px] text-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Supplier Physical Address</label>
                <input 
                  type="text"
                  required
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 text-[11px] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Supplier TIN Number</label>
                <input 
                  type="text"
                  required
                  value={supplierTin}
                  onChange={(e) => setSupplierTin(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 text-[11px] text-gray-800"
                />
              </div>
            </div>

            {/* Department and Expense Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Charge Department (Cost center)</label>
                <select 
                  value={chargeDept}
                  onChange={(e) => setChargeDept(e.target.value)}
                  className="w-full rounded border border-gray-300 p-1.5 font-bold bg-white text-xs"
                >
                  <option value="Kitchen">Kitchen Department</option>
                  <option value="FnB Restaurant">FnB Restaurant Group</option>
                  <option value="Commissary">Main Commissary Unit</option>
                  <option value="Resto Branches">Resto Branches Sub-outlay</option>
                  <option value="Housekeeping">Housekeeping Operations</option>
                  <option value="Engineering">Engineering Department</option>
                  <option value="Human Resources">Human Resources Office</option>
                  <option value="Top Management">Top Management Office</option>
                  <option value="Sales and Marketing">Sales & Marketing Group</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expense categorization type</label>
                <div className="flex gap-2">
                  {(['Food Item', 'Non-Food Item', 'Other Expenses'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setExpenseType(type)}
                      className={`flex-1 py-1.5 rounded text-[10px] tracking-wider uppercase font-black transition border ${
                        expenseType === type 
                          ? 'bg-blue-700 text-white border-blue-800 shadow-xs' 
                          : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-items Lines Table */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-55/35 space-y-2">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">Purchase Lines Particulars</span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="text-[9px] bg-blue-100 hover:bg-blue-200 text-blue-850 px-2.5 py-1 rounded uppercase font-black tracking-wider flex items-center leading-none"
                >
                  + Append Row
                </button>
              </div>

              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      {idx === 0 && <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Item code / description</label>}
                      <input 
                        type="text"
                        required
                        value={line.name}
                        onChange={(e) => handleUpdateLine(idx, 'name', e.target.value)}
                        placeholder="Potatoes, Cleaning Sponge, Detergent, Paper..."
                        className="w-full rounded border border-gray-300 p-1 text-[11px]"
                      />
                    </div>
                    <div className="w-20">
                      {idx === 0 && <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Qty</label>}
                      <input 
                        type="number"
                        required
                        value={line.qty || ''}
                        onChange={(e) => handleUpdateLine(idx, 'qty', Number(e.target.value))}
                        className="w-full rounded border border-gray-300 p-1 text-[11px] font-mono text-center"
                      />
                    </div>
                    <div className="w-16">
                      {idx === 0 && <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Unit</label>}
                      <input 
                        type="text"
                        required
                        value={line.unit}
                        onChange={(e) => handleUpdateLine(idx, 'unit', e.target.value)}
                        className="w-full rounded border border-gray-300 p-1 text-[11px] text-center"
                      />
                    </div>
                    <div className="w-24">
                      {idx === 0 && <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Price (PHP)</label>}
                      <input 
                        type="number"
                        required
                        value={line.unitPrice || ''}
                        onChange={(e) => handleUpdateLine(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full rounded border border-gray-300 p-1 text-[11px] font-mono text-right"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="bg-red-50 hover:bg-red-100 text-red-700/80 p-1.5 rounded transition border border-red-200"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            {successMsg && <p className="text-[10px] text-emerald-800 font-extrabold uppercase bg-emerald-50 border border-emerald-300 p-2 rounded">{successMsg}</p>}
            {errorMsg && <p className="text-[10px] text-red-800 font-extrabold uppercase bg-red-50 border border-red-300 p-2 rounded">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-black text-white font-black text-xs py-2.5 rounded shadow-lg uppercase tracking-wide transition flex items-center justify-center gap-1.5"
            >
              <FileCheck size={16} /> File Requisition Reconciliations
            </button>
          </form>
        </div>

        {/* Right Column: Requests History & Printer Action lists */}
        <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-800 border-b pb-2 flex items-center justify-between">
            <span>REAL-TIME COMPILATION OF PROCUREMENTS</span>
            <span className="bg-gray-100 text-gray-500 rounded-full text-[9px] px-2 py-0.5 font-bold">Total: {scopedRequests.length}</span>
          </h3>

          <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
            {scopedRequests.length === 0 ? (
              <p className="text-center text-gray-400 uppercase italic font-bold py-12">No current purchases registered in system.</p>
            ) : (
              scopedRequests.map(po => {
                const isPending = po.status === 'Pending';
                const isAdmin = currentUser.role === 'Admin';
                return (
                  <div key={po.id} className="border border-gray-250 rounded-lg p-3 bg-gray-55/40 hover:bg-gray-50 transition relative space-y-2">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[9px] text-gray-400 block tracking-wider uppercase bg-gray-100 w-fit px-1 rounded">{po.date} ({po.dateTime.slice(11, 16)})</span>
                        <p className="text-xs font-black text-gray-950 uppercase mt-1 leading-none">{po.supplierName}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-black mt-2 leading-none">TIN: {po.tin} | OR/SI NO: {po.orSiNo}</p>
                      </div>

                      {isPending ? (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 font-extrabold pb-0.5 text-[8px] uppercase px-2 rounded-full animate-pulse flex items-center gap-0.5">
                          <Clock size={10} /> Pending
                        </span>
                      ) : (
                        <span className={`pb-0.5 text-[8px] uppercase px-2 rounded-full font-black border flex items-center gap-0.5 ${
                          po.status === 'Received' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                        }`}>
                          <Check size={10} /> {po.status}
                        </span>
                      )}
                    </div>

                    <div className="bg-white p-2 rounded border border-gray-200 text-[10px] space-y-1">
                      <p className="text-[8px] text-gray-450 uppercase font-black border-b pb-0.5 tracking-widest leading-none mb-1">Requisition Items:</p>
                      {po.items.map((line, ix) => (
                        <div key={ix} className="flex justify-between text-gray-700">
                          <span className="truncate w-1/2">{line.name}</span>
                          <span className="font-mono font-bold">{line.qty} {line.unit} × {formatMoney(line.unitPrice)}</span>
                        </div>
                      ))}
                      <div className="border-t border-dashed pt-1.5 mt-1.5 flex justify-between items-center text-xs font-black text-blue-900 leading-none">
                        <span>Consolidated Outlay:</span>
                        <span className="font-mono">{formatMoney(po.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t">
                      <span className="text-[9px] bg-sky-50 text-sky-800 font-black uppercase px-2 py-0.5 rounded border">
                        {po.department} Charge
                      </span>

                      <div className="flex gap-1">
                        <button
                          onClick={() => setPrintTarget(po)}
                          className="bg-white hover:bg-gray-100 text-gray-750 font-bold p-1 px-2 text-[10px] uppercase rounded border transition flex items-center gap-1"
                        >
                          <Printer size={10} /> Print PO Slip
                        </button>

                        {isPending && isAdmin && (
                          <button
                            onClick={() => handleAdminApprove(po)}
                            className="bg-indigo-750 bg-indigo-700 hover:bg-indigo-800 text-white font-black p-1 px-2 text-[10px] uppercase rounded border border-indigo-800 shadow transition flex items-center gap-0.5"
                          >
                            <FileCheck size={10} /> Approve Order
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Manual Printing Slips Overlay Modal */}
      {printTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xl text-left border-3 border-gray-800 space-y-4">
            
            <div className="border-b-4 border-double border-gray-800 pb-3 flex justify-between items-start">
              <div>
                <h1 className="text-base font-black uppercase text-gray-950 font-serif tracking-tight">{(taxInfo?.businessName || 'JCC Ocean Bites Foodgroup Inc.').toUpperCase()} REQUISITION ORDER</h1>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Official procurement invoice receipt worksheet</p>
              </div>
              <div className="text-right">
                <span className="bg-gray-900 text-white font-mono text-[9px] px-2 py-1 select-none font-bold">REQUISITION BASE</span>
                <p className="text-[9px] text-gray-400 font-mono mt-1">SI: #{printTarget.orSiNo}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
              <div className="space-y-1">
                <p className="text-[9px] text-gray-400 uppercase font-black">Requisition Issuer Base:</p>
                <div className="bg-gray-50 p-2 rounded border leading-relaxed">
                  <p className="text-gray-950 font-black">{currentUser.fullName}</p>
                  <p className="text-gray-600">Branch: {printTarget.branchId}</p>
                  <p className="text-gray-600">Charged dept: {printTarget.department}</p>
                  <p className="text-gray-500 font-mono">Date Filed: {printTarget.date} {printTarget.dateTime.slice(11, 16)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[9px] text-gray-400 uppercase font-black">Supplier Directory Info:</p>
                <div className="bg-gray-50 p-2 rounded border leading-relaxed text-gray-600">
                  <p className="text-gray-950 font-black">{printTarget.supplierName}</p>
                  <p>Brand preset: {printTarget.supplierBrand}</p>
                  <p>TIN: {printTarget.tin}</p>
                  <p className="truncate">Address: {printTarget.address}</p>
                  <p>Contact No: {printTarget.contactInfo}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-[11px] font-medium border-t-2 border-b-2 border-gray-800 mt-2">
              <thead className="bg-gray-100 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                <tr className="border-b">
                  <th className="py-2 px-1">Item Description Particulars</th>
                  <th className="py-2 px-1 text-center">Unit</th>
                  <th className="py-2 px-1 text-center">QTY Count</th>
                  <th className="py-2 px-1 text-right">Invoice Rate</th>
                  <th className="py-2 px-1 text-right font-bold">Consolidated PHP</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold text-gray-800">
                {printTarget.items.map((line, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-1">{line.name}</td>
                    <td className="py-2 px-1 text-center text-gray-500 uppercase">{line.unit}</td>
                    <td className="py-2 px-1 text-center font-mono">{line.qty}</td>
                    <td className="py-2 px-1 text-right font-mono">{formatMoney(line.unitPrice)}</td>
                    <td className="py-2 px-1 text-right font-mono font-bold">{formatMoney(line.qty * line.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center text-sm font-black pt-2 bg-gray-50 p-2.5 rounded border border-gray-200">
              <span className="text-xs text-gray-450 uppercase">CONSOLIDATED INVOICE TOTAL DEBT:</span>
              <span className="font-mono text-base text-blue-900">{formatMoney(printTarget.totalAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[9px] pt-4 border-t uppercase text-gray-550 border-dashed">
              <div className="text-left">
                <p className="font-extrabold text-gray-400">FILED REQUISITION AUTHOR:</p>
                <div className="mt-4 border-b border-gray-500 w-44"></div>
                <p className="pt-1 text-gray-900 font-black">{printTarget.supplierBrand} Presets Coordinator</p>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className="font-extrabold text-gray-400">AUTHORIZED OVERSEER APPROVAL:</p>
                <div className="mt-4 border-b border-gray-500 w-44"></div>
                <p className="pt-1 text-gray-900 font-extrabold">CHEF MICHAEL LLENA / {(taxInfo?.businessName || 'JCC').toUpperCase()} SPECIALIST</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 z-50">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-900 hover:bg-black text-white font-black text-xs py-2 rounded uppercase flex items-center justify-center gap-1.5 transition shadow"
              >
                <Printer size={13} /> Execute Laser Printing
              </button>
              <button
                onClick={() => setPrintTarget(null)}
                className="w-24 bg-gray-150 hover:bg-gray-200 text-gray-800 font-black text-xs py-2 rounded uppercase border transition text-center"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
